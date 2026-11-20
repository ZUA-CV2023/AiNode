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
package model

import (
	"errors"
	"strconv"

	"github.com/QuantumNous/new-api/common"
)

const (
	FeedbackCategoryBug     = "bug"
	FeedbackCategoryFeature = "feature"
	FeedbackCategoryOther   = "other"

	FeedbackStatusPending    = "pending"
	FeedbackStatusProcessing = "processing"
	FeedbackStatusResolved   = "resolved"
	FeedbackStatusIgnored    = "ignored"
)

// Feedback is a user-submitted product feedback entry. Timestamps are Unix
// seconds to match the rest of the project's models and to keep range queries
// identical on SQLite, MySQL, and PostgreSQL.
type Feedback struct {
	Id        int    `json:"id"`
	UserId    int    `json:"user_id" gorm:"not null;index"`
	Category  string `json:"category" gorm:"type:varchar(32);not null"`
	Content   string `json:"content" gorm:"type:text;not null"`
	Contact   string `json:"contact" gorm:"type:varchar(255);not null;default:''"`
	PageUrl   string `json:"page_url" gorm:"type:varchar(255);not null;default:''"`
	UserAgent string `json:"user_agent" gorm:"type:varchar(255);not null;default:''"`
	Status    string `json:"status" gorm:"type:varchar(32);not null;index;default:'pending'"`
	AdminNote string `json:"admin_note" gorm:"type:text"`
	CreatedAt int64  `json:"created_at" gorm:"bigint;index"`
	UpdatedAt int64  `json:"updated_at" gorm:"bigint"`
}

func (Feedback) TableName() string {
	return "feedback"
}

// FeedbackWithUser is the admin list/detail row: feedback plus the submitting
// user's identity. UserDeleted is true when the user row is missing or
// soft-deleted, so the admin UI can fall back to the stored user_id.
type FeedbackWithUser struct {
	Feedback
	Username    string `json:"username"`
	Email       string `json:"email"`
	UserDeleted bool   `json:"user_deleted"`
	UserIdFound *int   `json:"-"`
}

func (feedback *Feedback) Insert() error {
	now := common.GetTimestamp()
	feedback.CreatedAt = now
	feedback.UpdatedAt = now
	if feedback.Status == "" {
		feedback.Status = FeedbackStatusPending
	}
	return DB.Create(feedback).Error
}

// CountFeedbackByUserSince counts the user's submissions created at or after
// the given Unix timestamp. It backs the per-user 24-hour submission limit.
func CountFeedbackByUserSince(userId int, since int64) (int64, error) {
	var count int64
	err := DB.Model(&Feedback{}).
		Where("user_id = ? AND created_at >= ?", userId, since).
		Count(&count).Error
	return count, err
}

func GetFeedbackByUser(userId int, startIdx int, pageSize int) ([]*Feedback, int64, error) {
	query := DB.Model(&Feedback{}).Where("user_id = ?", userId)
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var feedbacks []*Feedback
	err := query.
		Order("created_at desc, id desc").
		Limit(pageSize).
		Offset(startIdx).
		Find(&feedbacks).Error
	return feedbacks, total, err
}

func GetAllFeedback(status string, category string, keyword string, startIdx int, pageSize int) ([]*FeedbackWithUser, int64, error) {
	query := DB.Model(&Feedback{}).
		Joins("LEFT JOIN users ON users.id = feedback.user_id AND users.deleted_at IS NULL")
	if status != "" {
		query = query.Where("feedback.status = ?", status)
	}
	if category != "" {
		query = query.Where("feedback.category = ?", category)
	}
	if keyword != "" {
		like := "%" + keyword + "%"
		if id, err := strconv.Atoi(keyword); err == nil {
			query = query.Where(
				"feedback.id = ? OR feedback.user_id = ? OR feedback.content LIKE ? OR feedback.contact LIKE ? OR feedback.page_url LIKE ?",
				id, id, like, like, like,
			)
		} else {
			query = query.Where(
				"feedback.content LIKE ? OR feedback.contact LIKE ? OR feedback.page_url LIKE ? OR feedback.user_agent LIKE ?",
				like, like, like, like,
			)
		}
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var feedbacks []*FeedbackWithUser
	err := query.
		Select("feedback.*, users.username AS username, users.email AS email, users.id AS user_id_found").
		Order("feedback.created_at desc, feedback.id desc").
		Limit(pageSize).
		Offset(startIdx).
		Find(&feedbacks).Error
	if err != nil {
		return nil, 0, err
	}
	for _, feedback := range feedbacks {
		feedback.UserDeleted = feedback.UserIdFound == nil
	}
	return feedbacks, total, nil
}

func GetFeedbackById(id int) (*Feedback, error) {
	if id <= 0 {
		return nil, errors.New("invalid feedback id")
	}
	var feedback Feedback
	if err := DB.First(&feedback, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &feedback, nil
}

func (feedback *Feedback) UpdateAdminFields(status string, adminNote string) error {
	feedback.Status = status
	feedback.AdminNote = adminNote
	feedback.UpdatedAt = common.GetTimestamp()
	return DB.Model(feedback).Updates(map[string]any{
		"status":     status,
		"admin_note": adminNote,
		"updated_at": feedback.UpdatedAt,
	}).Error
}

// FeedbackStatusValid reports whether status is one of the admin statuses.
func FeedbackStatusValid(status string) bool {
	switch status {
	case FeedbackStatusPending, FeedbackStatusProcessing, FeedbackStatusResolved, FeedbackStatusIgnored:
		return true
	default:
		return false
	}
}

// FeedbackCategoryValid reports whether category is one of the supported types.
func FeedbackCategoryValid(category string) bool {
	switch category {
	case FeedbackCategoryBug, FeedbackCategoryFeature, FeedbackCategoryOther:
		return true
	default:
		return false
	}
}
