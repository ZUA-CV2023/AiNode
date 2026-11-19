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
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func resetFeedbackTable(t *testing.T) {
	t.Helper()
	require.NoError(t, DB.AutoMigrate(&Feedback{}))
	require.NoError(t, DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&Feedback{}).Error)
	t.Cleanup(func() {
		require.NoError(t, DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&Feedback{}).Error)
	})
}

func TestFeedbackInsertSetsDefaults(t *testing.T) {
	resetFeedbackTable(t)

	feedback := &Feedback{
		UserId:   7,
		Category: FeedbackCategoryBug,
		Content:  "Something broke",
	}
	require.NoError(t, feedback.Insert())

	require.NotZero(t, feedback.Id)
	assert.Equal(t, FeedbackStatusPending, feedback.Status)
	assert.NotZero(t, feedback.CreatedAt)
	assert.Equal(t, feedback.CreatedAt, feedback.UpdatedAt)

	var stored Feedback
	require.NoError(t, DB.First(&stored, feedback.Id).Error)
	assert.Equal(t, "Something broke", stored.Content)
	assert.Equal(t, FeedbackCategoryBug, stored.Category)
}

func TestGetFeedbackByUserPaginatesNewestFirst(t *testing.T) {
	resetFeedbackTable(t)

	now := common.GetTimestamp()
	rows := []Feedback{
		{UserId: 1, Category: FeedbackCategoryOther, Content: "oldest", CreatedAt: now - 30, UpdatedAt: now - 30},
		{UserId: 1, Category: FeedbackCategoryOther, Content: "middle", CreatedAt: now - 20, UpdatedAt: now - 20},
		{UserId: 1, Category: FeedbackCategoryOther, Content: "newest", CreatedAt: now - 10, UpdatedAt: now - 10},
		{UserId: 2, Category: FeedbackCategoryOther, Content: "other user", CreatedAt: now, UpdatedAt: now},
	}
	require.NoError(t, DB.Create(&rows).Error)

	items, total, err := GetFeedbackByUser(1, 0, 2)
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)
	require.Len(t, items, 2)
	assert.Equal(t, "newest", items[0].Content)
	assert.Equal(t, "middle", items[1].Content)

	items, total, err = GetFeedbackByUser(1, 2, 2)
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)
	require.Len(t, items, 1)
	assert.Equal(t, "oldest", items[0].Content)
}

func TestCountFeedbackByUserSince(t *testing.T) {
	resetFeedbackTable(t)

	now := common.GetTimestamp()
	rows := []Feedback{
		{UserId: 1, Category: FeedbackCategoryOther, Content: "recent", CreatedAt: now - 60, UpdatedAt: now - 60},
		{UserId: 1, Category: FeedbackCategoryOther, Content: "yesterday", CreatedAt: now - 3600, UpdatedAt: now - 3600},
		{UserId: 1, Category: FeedbackCategoryOther, Content: "too old", CreatedAt: now - 25*3600, UpdatedAt: now - 25*3600},
		{UserId: 2, Category: FeedbackCategoryOther, Content: "another user", CreatedAt: now, UpdatedAt: now},
	}
	require.NoError(t, DB.Create(&rows).Error)

	count, err := CountFeedbackByUserSince(1, now-24*3600)
	require.NoError(t, err)
	assert.Equal(t, int64(2), count)
}

func TestGetAllFeedbackFilters(t *testing.T) {
	resetFeedbackTable(t)

	now := common.GetTimestamp()
	rows := []Feedback{
		{UserId: 1, Category: FeedbackCategoryBug, Status: FeedbackStatusPending, Content: "login button broken", Contact: "a@example.com", CreatedAt: now - 30, UpdatedAt: now - 30},
		{UserId: 2, Category: FeedbackCategoryBug, Status: FeedbackStatusResolved, Content: "login page slow", Contact: "b@example.com", CreatedAt: now - 20, UpdatedAt: now - 20},
		{UserId: 3, Category: FeedbackCategoryFeature, Status: FeedbackStatusPending, Content: "add dark mode", Contact: "c@example.com", CreatedAt: now - 10, UpdatedAt: now - 10},
	}
	require.NoError(t, DB.Create(&rows).Error)

	tests := []struct {
		name     string
		status   string
		category string
		keyword  string
		want     []string
	}{
		{
			name:   "status and category filters combine",
			status: FeedbackStatusPending, category: FeedbackCategoryBug,
			want: []string{"login button broken"},
		},
		{
			name:    "keyword searches content",
			keyword: "login",
			want:    []string{"login page slow", "login button broken"},
		},
		{
			name:    "keyword searches contact",
			keyword: "c@example.com",
			want:    []string{"add dark mode"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			items, total, err := GetAllFeedback(test.status, test.category, test.keyword, 0, 10)
			require.NoError(t, err)
			assert.Equal(t, int64(len(test.want)), total)
			require.Len(t, items, len(test.want))
			for index, want := range test.want {
				assert.Equal(t, want, items[index].Content)
			}
		})
	}
}

func TestFeedbackCategoryAndStatusValidation(t *testing.T) {
	for _, category := range []string{FeedbackCategoryBug, FeedbackCategoryFeature, FeedbackCategoryOther} {
		assert.True(t, FeedbackCategoryValid(category))
	}
	assert.False(t, FeedbackCategoryValid(""))
	assert.False(t, FeedbackCategoryValid("unknown"))

	for _, status := range []string{FeedbackStatusPending, FeedbackStatusProcessing, FeedbackStatusResolved, FeedbackStatusIgnored} {
		assert.True(t, FeedbackStatusValid(status))
	}
	assert.False(t, FeedbackStatusValid(""))
	assert.False(t, FeedbackStatusValid("done"))
}
