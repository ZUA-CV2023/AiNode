/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
package controller

import (
	"errors"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	feedbackContentMinLength   = 10
	feedbackContentMaxLength   = 2000
	feedbackContactMaxLength   = 255
	feedbackAdminNoteMaxLength = 2000
	feedbackPageURLMaxLength   = 255
	feedbackUserAgentMaxLength = 255
	feedbackDailyLimit         = 10
	feedbackDailyWindowSeconds = 24 * 60 * 60
)

type feedbackSubmitRequest struct {
	Category string `json:"category"`
	Content  string `json:"content"`
	Contact  string `json:"contact"`
	PageUrl  string `json:"page_url"`
}

type feedbackUpdateRequest struct {
	Status    string `json:"status"`
	AdminNote string `json:"admin_note"`
}

// feedbackUserItem is the user-facing view. Admin notes stay private to the
// management API.
type feedbackUserItem struct {
	Id        int    `json:"id"`
	Category  string `json:"category"`
	Content   string `json:"content"`
	Contact   string `json:"contact"`
	PageUrl   string `json:"page_url"`
	Status    string `json:"status"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

func SubmitFeedback(c *gin.Context) {
	userId := c.GetInt("id")
	if userId <= 0 {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	var request feedbackSubmitRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	category := strings.TrimSpace(request.Category)
	if !model.FeedbackCategoryValid(category) {
		common.ApiErrorT(c, "Invalid feedback category")
		return
	}

	content := strings.TrimSpace(request.Content)
	contentLength := utf8.RuneCountInString(content)
	if contentLength < feedbackContentMinLength || contentLength > feedbackContentMaxLength {
		common.ApiErrorT(c, "Feedback content must be between 10 and 2000 characters")
		return
	}

	contact := strings.TrimSpace(request.Contact)
	if utf8.RuneCountInString(contact) > feedbackContactMaxLength {
		common.ApiErrorT(c, "Contact information must be 255 characters or fewer")
		return
	}

	recentCount, err := model.CountFeedbackByUserSince(userId, common.GetTimestamp()-feedbackDailyWindowSeconds)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if recentCount >= feedbackDailyLimit {
		common.ApiErrorT(c, "You can submit at most 10 feedback items per 24 hours")
		return
	}

	feedback := &model.Feedback{
		UserId:    userId,
		Category:  category,
		Content:   content,
		Contact:   contact,
		PageUrl:   truncateFeedbackRunes(strings.TrimSpace(request.PageUrl), feedbackPageURLMaxLength),
		UserAgent: truncateFeedbackRunes(strings.TrimSpace(c.Request.UserAgent()), feedbackUserAgentMaxLength),
		Status:    model.FeedbackStatusPending,
	}
	if err := feedback.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, gin.H{"id": feedback.Id})
}

func GetUserFeedback(c *gin.Context) {
	userId := c.GetInt("id")
	if userId <= 0 {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	pageInfo := common.GetPageQuery(c)
	feedbacks, total, err := model.GetFeedbackByUser(userId, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}

	items := make([]feedbackUserItem, 0, len(feedbacks))
	for _, feedback := range feedbacks {
		items = append(items, feedbackUserItem{
			Id:        feedback.Id,
			Category:  feedback.Category,
			Content:   feedback.Content,
			Contact:   feedback.Contact,
			PageUrl:   feedback.PageUrl,
			Status:    feedback.Status,
			CreatedAt: feedback.CreatedAt,
			UpdatedAt: feedback.UpdatedAt,
		})
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(items)
	common.ApiSuccess(c, pageInfo)
}

func GetAllFeedback(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)

	status := strings.TrimSpace(c.Query("status"))
	if status != "" && !model.FeedbackStatusValid(status) {
		common.ApiErrorT(c, "Invalid feedback status")
		return
	}

	category := strings.TrimSpace(c.Query("category"))
	if category != "" && !model.FeedbackCategoryValid(category) {
		common.ApiErrorT(c, "Invalid feedback category")
		return
	}

	keyword := strings.TrimSpace(c.Query("keyword"))
	feedbacks, total, err := model.GetAllFeedback(status, category, keyword, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(feedbacks)
	common.ApiSuccess(c, pageInfo)
}

func UpdateFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	var request feedbackUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	status := strings.TrimSpace(request.Status)
	if !model.FeedbackStatusValid(status) {
		common.ApiErrorT(c, "Invalid feedback status")
		return
	}

	adminNote := strings.TrimSpace(request.AdminNote)
	if utf8.RuneCountInString(adminNote) > feedbackAdminNoteMaxLength {
		common.ApiErrorT(c, "Admin note must be 2000 characters or fewer")
		return
	}

	feedback, err := model.GetFeedbackById(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			common.ApiErrorT(c, "Feedback does not exist")
			return
		}
		common.ApiError(c, err)
		return
	}

	if err := feedback.UpdateAdminFields(status, adminNote); err != nil {
		common.ApiError(c, err)
		return
	}

	recordManageAudit(c, "feedback.update", map[string]any{
		"feedback_id": id,
		"status":      status,
	})
	common.ApiSuccess(c, feedback)
}

func truncateFeedbackRunes(value string, maxLength int) string {
	if maxLength <= 0 {
		return ""
	}
	runes := []rune(value)
	if len(runes) <= maxLength {
		return value
	}
	return string(runes[:maxLength])
}
