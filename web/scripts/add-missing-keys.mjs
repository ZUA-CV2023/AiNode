import fs from 'node:fs/promises'
import path from 'node:path'

const LOCALES_DIR = path.resolve('src/i18n/locales')

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + '\n'
}

const newKeys = {
  en: {
    Weak: 'Weak',
    Medium: 'Medium',
    Strong: 'Strong',
    'Very strong': 'Very strong',
    Feedback: 'Feedback',
    'Submit Feedback': 'Submit Feedback',
    'Tell us about a bug, a feature request, or anything else.':
      'Tell us about a bug, a feature request, or anything else.',
    'Feedback Type': 'Feedback Type',
    Bug: 'Bug',
    'Feature Request': 'Feature Request',
    'Feedback Content': 'Feedback Content',
    'Please describe the issue or suggestion (10-2000 characters)':
      'Please describe the issue or suggestion (10-2000 characters)',
    'Contact (optional)': 'Contact (optional)',
    'Email or WeChat (optional)': 'Email or WeChat (optional)',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      'Your account and the current page will be recorded with this submission and used only to improve the product.',
    'Feedback submitted. Thank you!': 'Feedback submitted. Thank you!',
    'Failed to submit feedback': 'Failed to submit feedback',
    'Feedback content must be between 10 and 2000 characters':
      'Feedback content must be between 10 and 2000 characters',
    'Contact information must be 255 characters or fewer':
      'Contact information must be 255 characters or fewer',
    'Admin note must be 2000 characters or fewer':
      'Admin note must be 2000 characters or fewer',
    'You can submit at most 10 feedback items per 24 hours':
      'You can submit at most 10 feedback items per 24 hours',
    'Invalid feedback category': 'Invalid feedback category',
    'Invalid feedback status': 'Invalid feedback status',
    'Feedback does not exist': 'Feedback does not exist',
    'Feedback Management': 'Feedback Management',
    Processing: 'Processing',
    Resolved: 'Resolved',
    Ignored: 'Ignored',
    'Search feedback by content, contact, page, or user ID...':
      'Search feedback by content, contact, page, or user ID...',
    'No feedback yet': 'No feedback yet',
    'No feedback matches the current filters.':
      'No feedback matches the current filters.',
    'Try changing the keyword, status, or type filter.':
      'Try changing the keyword, status, or type filter.',
    'User submissions will appear here.': 'User submissions will appear here.',
    'Failed to load feedback': 'Failed to load feedback',
    'Feedback Details': 'Feedback Details',
    'Submitted at': 'Submitted at',
    Contact: 'Contact',
    'Admin Note': 'Admin Note',
    'Add an internal note about how this feedback was handled.':
      'Add an internal note about how this feedback was handled.',
    'Only administrators can see this note.':
      'Only administrators can see this note.',
    'Feedback updated': 'Feedback updated',
    'Failed to update feedback': 'Failed to update feedback',
  },
  zh: {
    Weak: '弱',
    Medium: '中等',
    Strong: '强',
    'Very strong': '非常强',
    Feedback: '反馈',
    'Submit Feedback': '提交反馈',
    'Tell us about a bug, a feature request, or anything else.':
      '告诉我们你遇到的问题、想要的功能，或其他想法。',
    'Feedback Type': '反馈类型',
    Bug: '问题反馈',
    'Feature Request': '功能建议',
    'Feedback Content': '反馈内容',
    'Please describe the issue or suggestion (10-2000 characters)':
      '请描述问题或建议（10-2000 字）',
    'Contact (optional)': '联系方式（可选）',
    'Email or WeChat (optional)': '邮箱或微信号（可选）',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      '提交内容会记录你的账号和当前页面，仅用于改进产品。',
    'Feedback submitted. Thank you!': '反馈已提交，感谢！',
    'Failed to submit feedback': '提交反馈失败',
    'Feedback content must be between 10 and 2000 characters':
      '反馈内容长度必须在 10-2000 字之间',
    'Contact information must be 255 characters or fewer':
      '联系方式不能超过 255 个字符',
    'Admin note must be 2000 characters or fewer':
      '管理员备注不能超过 2000 个字符',
    'You can submit at most 10 feedback items per 24 hours':
      '每 24 小时最多提交 10 条反馈',
    'Invalid feedback category': '无效的反馈类型',
    'Invalid feedback status': '无效的反馈状态',
    'Feedback does not exist': '反馈不存在',
    'Feedback Management': '反馈管理',
    Processing: '处理中',
    Resolved: '已解决',
    Ignored: '已忽略',
    'Search feedback by content, contact, page, or user ID...':
      '按内容、联系方式、页面或用户 ID 搜索反馈...',
    'No feedback yet': '暂无反馈',
    'No feedback matches the current filters.':
      '没有符合当前筛选条件的反馈。',
    'Try changing the keyword, status, or type filter.':
      '试试更换关键字、状态或类型筛选。',
    'User submissions will appear here.': '用户提交的反馈会显示在这里。',
    'Failed to load feedback': '加载反馈失败',
    'Feedback Details': '反馈详情',
    'Submitted at': '提交时间',
    Contact: '联系方式',
    'Admin Note': '管理员备注',
    'Add an internal note about how this feedback was handled.':
      '添加一条内部备注，说明这条反馈的处理情况。',
    'Only administrators can see this note.':
      '只有管理员能看到这条备注。',
    'Feedback updated': '反馈已更新',
    'Failed to update feedback': '更新反馈失败',
  },
  'zh-TW': {
    Weak: '弱',
    Medium: '中等',
    Strong: '強',
    'Very strong': '非常強',
    Feedback: '回饋',
    'Submit Feedback': '提交回饋',
    'Tell us about a bug, a feature request, or anything else.':
      '告訴我們你遇到的問題、想要的功能，或其他想法。',
    'Feedback Type': '回饋類型',
    Bug: '問題回報',
    'Feature Request': '功能建議',
    'Feedback Content': '回饋內容',
    'Please describe the issue or suggestion (10-2000 characters)':
      '請描述問題或建議（10-2000 字）',
    'Contact (optional)': '聯絡方式（選填）',
    'Email or WeChat (optional)': '電子郵件或微信號（選填）',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      '提交內容會記錄你的帳號和目前頁面，僅用於改善產品。',
    'Feedback submitted. Thank you!': '回饋已提交，感謝！',
    'Failed to submit feedback': '提交回饋失敗',
    'Feedback content must be between 10 and 2000 characters':
      '回饋內容長度必須在 10-2000 字之間',
    'Contact information must be 255 characters or fewer':
      '聯絡方式不能超過 255 個字元',
    'Admin note must be 2000 characters or fewer':
      '管理員備註不能超過 2000 個字元',
    'You can submit at most 10 feedback items per 24 hours':
      '每 24 小時最多提交 10 條回饋',
    'Invalid feedback category': '無效的回饋類型',
    'Invalid feedback status': '無效的回饋狀態',
    'Feedback does not exist': '回饋不存在',
    'Feedback Management': '回饋管理',
    Processing: '處理中',
    Resolved: '已解決',
    Ignored: '已忽略',
    'Search feedback by content, contact, page, or user ID...':
      '依內容、聯絡方式、頁面或使用者 ID 搜尋回饋...',
    'No feedback yet': '尚無回饋',
    'No feedback matches the current filters.':
      '沒有符合目前篩選條件的回饋。',
    'Try changing the keyword, status, or type filter.':
      '試試更換關鍵字、狀態或類型篩選。',
    'User submissions will appear here.': '使用者提交的回饋會顯示在這裡。',
    'Failed to load feedback': '載入回饋失敗',
    'Feedback Details': '回饋詳情',
    'Submitted at': '提交時間',
    Contact: '聯絡方式',
    'Admin Note': '管理員備註',
    'Add an internal note about how this feedback was handled.':
      '新增一則內部備註，說明這則回饋的處理情況。',
    'Only administrators can see this note.':
      '只有管理員能看到這則備註。',
    'Feedback updated': '回饋已更新',
    'Failed to update feedback': '更新回饋失敗',
  },
  fr: {
    Weak: 'Faible',
    Medium: 'Moyen',
    Strong: 'Fort',
    'Very strong': 'Très fort',
    Feedback: 'Retour',
    'Submit Feedback': 'Envoyer un retour',
    'Tell us about a bug, a feature request, or anything else.':
      'Décrivez-nous un problème, une demande de fonctionnalité ou toute autre idée.',
    'Feedback Type': 'Type de retour',
    Bug: 'Problème',
    'Feature Request': 'Demande de fonctionnalité',
    'Feedback Content': 'Contenu du retour',
    'Please describe the issue or suggestion (10-2000 characters)':
      'Décrivez le problème ou la suggestion (10 à 2000 caractères)',
    'Contact (optional)': 'Contact (facultatif)',
    'Email or WeChat (optional)': 'E-mail ou WeChat (facultatif)',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      'Votre compte et la page actuelle seront enregistrés avec cette soumission et utilisés uniquement pour améliorer le produit.',
    'Feedback submitted. Thank you!': 'Retour envoyé. Merci !',
    'Failed to submit feedback': 'Échec de l\'envoi du retour',
    'Feedback content must be between 10 and 2000 characters':
      'Le contenu du retour doit contenir entre 10 et 2000 caractères',
    'Contact information must be 255 characters or fewer':
      'Les coordonnées ne doivent pas dépasser 255 caractères',
    'Admin note must be 2000 characters or fewer':
      'La note administrative ne doit pas dépasser 2000 caractères',
    'You can submit at most 10 feedback items per 24 hours':
      'Vous pouvez envoyer au maximum 10 retours par 24 heures',
    'Invalid feedback category': 'Type de retour invalide',
    'Invalid feedback status': 'Statut du retour invalide',
    'Feedback does not exist': 'Le retour n\'existe pas',
    'Feedback Management': 'Gestion des retours',
    Processing: 'En cours',
    Resolved: 'Résolu',
    Ignored: 'Ignoré',
    'Search feedback by content, contact, page, or user ID...':
      'Rechercher un retour par contenu, contact, page ou ID utilisateur...',
    'No feedback yet': 'Aucun retour pour le moment',
    'No feedback matches the current filters.':
      'Aucun retour ne correspond aux filtres actuels.',
    'Try changing the keyword, status, or type filter.':
      'Essayez de modifier le mot-clé, le statut ou le type.',
    'User submissions will appear here.':
      'Les retours des utilisateurs apparaîtront ici.',
    'Failed to load feedback': 'Échec du chargement des retours',
    'Feedback Details': 'Détails du retour',
    'Submitted at': 'Envoyé le',
    Contact: 'Contact',
    'Admin Note': 'Note administrative',
    'Add an internal note about how this feedback was handled.':
      'Ajoutez une note interne sur le traitement de ce retour.',
    'Only administrators can see this note.':
      'Seuls les administrateurs peuvent voir cette note.',
    'Feedback updated': 'Retour mis à jour',
    'Failed to update feedback': 'Échec de la mise à jour du retour',
  },
  ja: {
    Weak: '弱い',
    Medium: '中程度',
    Strong: '強い',
    'Very strong': '非常に強い',
    Feedback: 'フィードバック',
    'Submit Feedback': 'フィードバックを送信',
    'Tell us about a bug, a feature request, or anything else.':
      '不具合、機能リクエスト、その他のご意見をお聞かせください。',
    'Feedback Type': 'フィードバックの種類',
    Bug: '不具合',
    'Feature Request': '機能リクエスト',
    'Feedback Content': 'フィードバック内容',
    'Please describe the issue or suggestion (10-2000 characters)':
      '問題や提案を入力してください（10〜2000文字）',
    'Contact (optional)': '連絡先（任意）',
    'Email or WeChat (optional)': 'メールまたは WeChat（任意）',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      'この送信ではアカウントと現在のページが記録され、製品改善のみに使用されます。',
    'Feedback submitted. Thank you!':
      'フィードバックを送信しました。ありがとうございます！',
    'Failed to submit feedback': 'フィードバックの送信に失敗しました',
    'Feedback content must be between 10 and 2000 characters':
      'フィードバック内容は10〜2000文字で入力してください',
    'Contact information must be 255 characters or fewer':
      '連絡先は255文字以内で入力してください',
    'Admin note must be 2000 characters or fewer':
      '管理者メモは2000文字以内で入力してください',
    'You can submit at most 10 feedback items per 24 hours':
      '24時間以内に送信できるフィードバックは最大10件です',
    'Invalid feedback category': 'フィードバックの種類が無効です',
    'Invalid feedback status': 'フィードバックのステータスが無効です',
    'Feedback does not exist': 'フィードバックが見つかりません',
    'Feedback Management': 'フィードバック管理',
    Processing: '処理中',
    Resolved: '解決済み',
    Ignored: '無視',
    'Search feedback by content, contact, page, or user ID...':
      '内容、連絡先、ページ、ユーザーIDでフィードバックを検索...',
    'No feedback yet': 'フィードバックはまだありません',
    'No feedback matches the current filters.':
      '現在のフィルターに一致するフィードバックはありません。',
    'Try changing the keyword, status, or type filter.':
      'キーワード、ステータス、種類のフィルターを変更してみてください。',
    'User submissions will appear here.':
      'ユーザーからのフィードバックがここに表示されます。',
    'Failed to load feedback': 'フィードバックの読み込みに失敗しました',
    'Feedback Details': 'フィードバックの詳細',
    'Submitted at': '送信日時',
    Contact: '連絡先',
    'Admin Note': '管理者メモ',
    'Add an internal note about how this feedback was handled.':
      'このフィードバックの対応状況について内部メモを追加します。',
    'Only administrators can see this note.':
      'このメモは管理者のみ閲覧できます。',
    'Feedback updated': 'フィードバックを更新しました',
    'Failed to update feedback': 'フィードバックの更新に失敗しました',
  },
  ru: {
    Weak: 'Слабый',
    Medium: 'Средний',
    Strong: 'Сильный',
    'Very strong': 'Очень сильный',
    Feedback: 'Обратная связь',
    'Submit Feedback': 'Отправить отзыв',
    'Tell us about a bug, a feature request, or anything else.':
      'Расскажите об ошибке, пожелании или другой идее.',
    'Feedback Type': 'Тип отзыва',
    Bug: 'Ошибка',
    'Feature Request': 'Пожелание функции',
    'Feedback Content': 'Содержание отзыва',
    'Please describe the issue or suggestion (10-2000 characters)':
      'Опишите проблему или предложение (10–2000 символов)',
    'Contact (optional)': 'Контакт (необязательно)',
    'Email or WeChat (optional)': 'Эл. почта или WeChat (необязательно)',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      'При отправке будут записаны ваш аккаунт и текущая страница; они используются только для улучшения продукта.',
    'Feedback submitted. Thank you!': 'Отзыв отправлен. Спасибо!',
    'Failed to submit feedback': 'Не удалось отправить отзыв',
    'Feedback content must be between 10 and 2000 characters':
      'Содержание отзыва должно быть от 10 до 2000 символов',
    'Contact information must be 255 characters or fewer':
      'Контактные данные должны быть не длиннее 255 символов',
    'Admin note must be 2000 characters or fewer':
      'Заметка администратора должна быть не длиннее 2000 символов',
    'You can submit at most 10 feedback items per 24 hours':
      'За 24 часа можно отправить не более 10 отзывов',
    'Invalid feedback category': 'Неверный тип отзыва',
    'Invalid feedback status': 'Неверный статус отзыва',
    'Feedback does not exist': 'Отзыв не найден',
    'Feedback Management': 'Управление отзывами',
    Processing: 'В обработке',
    Resolved: 'Решено',
    Ignored: 'Игнорируется',
    'Search feedback by content, contact, page, or user ID...':
      'Поиск отзывов по содержанию, контакту, странице или ID пользователя...',
    'No feedback yet': 'Отзывов пока нет',
    'No feedback matches the current filters.':
      'Нет отзывов, соответствующих текущим фильтрам.',
    'Try changing the keyword, status, or type filter.':
      'Попробуйте изменить ключевое слово, статус или тип.',
    'User submissions will appear here.':
      'Здесь будут отображаться отзывы пользователей.',
    'Failed to load feedback': 'Не удалось загрузить отзывы',
    'Feedback Details': 'Детали отзыва',
    'Submitted at': 'Отправлено',
    Contact: 'Контакт',
    'Admin Note': 'Заметка администратора',
    'Add an internal note about how this feedback was handled.':
      'Добавьте внутреннюю заметку об обработке этого отзыва.',
    'Only administrators can see this note.':
      'Эту заметку видят только администраторы.',
    'Feedback updated': 'Отзыв обновлён',
    'Failed to update feedback': 'Не удалось обновить отзыв',
  },
  vi: {
    Weak: 'Yếu',
    Medium: 'Trung bình',
    Strong: 'Mạnh',
    'Very strong': 'Rất mạnh',
    Feedback: 'Phản hồi',
    'Submit Feedback': 'Gửi phản hồi',
    'Tell us about a bug, a feature request, or anything else.':
      'Hãy cho chúng tôi biết về lỗi, yêu cầu tính năng hoặc bất kỳ ý kiến nào khác.',
    'Feedback Type': 'Loại phản hồi',
    Bug: 'Lỗi',
    'Feature Request': 'Yêu cầu tính năng',
    'Feedback Content': 'Nội dung phản hồi',
    'Please describe the issue or suggestion (10-2000 characters)':
      'Vui lòng mô tả vấn đề hoặc đề xuất (10-2000 ký tự)',
    'Contact (optional)': 'Liên hệ (không bắt buộc)',
    'Email or WeChat (optional)': 'Email hoặc WeChat (không bắt buộc)',
    'Your account and the current page will be recorded with this submission and used only to improve the product.':
      'Tài khoản và trang hiện tại của bạn sẽ được ghi lại cùng nội dung gửi và chỉ dùng để cải thiện sản phẩm.',
    'Feedback submitted. Thank you!': 'Đã gửi phản hồi. Cảm ơn bạn!',
    'Failed to submit feedback': 'Gửi phản hồi thất bại',
    'Feedback content must be between 10 and 2000 characters':
      'Nội dung phản hồi phải từ 10 đến 2000 ký tự',
    'Contact information must be 255 characters or fewer':
      'Thông tin liên hệ không được vượt quá 255 ký tự',
    'Admin note must be 2000 characters or fewer':
      'Ghi chú quản trị không được vượt quá 2000 ký tự',
    'You can submit at most 10 feedback items per 24 hours':
      'Bạn có thể gửi tối đa 10 phản hồi trong 24 giờ',
    'Invalid feedback category': 'Loại phản hồi không hợp lệ',
    'Invalid feedback status': 'Trạng thái phản hồi không hợp lệ',
    'Feedback does not exist': 'Phản hồi không tồn tại',
    'Feedback Management': 'Quản lý phản hồi',
    Processing: 'Đang xử lý',
    Resolved: 'Đã giải quyết',
    Ignored: 'Đã bỏ qua',
    'Search feedback by content, contact, page, or user ID...':
      'Tìm phản hồi theo nội dung, liên hệ, trang hoặc ID người dùng...',
    'No feedback yet': 'Chưa có phản hồi',
    'No feedback matches the current filters.':
      'Không có phản hồi nào khớp với bộ lọc hiện tại.',
    'Try changing the keyword, status, or type filter.':
      'Hãy thử thay đổi từ khóa, trạng thái hoặc loại.',
    'User submissions will appear here.':
      'Phản hồi của người dùng sẽ xuất hiện ở đây.',
    'Failed to load feedback': 'Tải phản hồi thất bại',
    'Feedback Details': 'Chi tiết phản hồi',
    'Submitted at': 'Thời gian gửi',
    Contact: 'Liên hệ',
    'Admin Note': 'Ghi chú quản trị',
    'Add an internal note about how this feedback was handled.':
      'Thêm ghi chú nội bộ về cách xử lý phản hồi này.',
    'Only administrators can see this note.':
      'Chỉ quản trị viên mới thấy ghi chú này.',
    'Feedback updated': 'Đã cập nhật phản hồi',
    'Failed to update feedback': 'Cập nhật phản hồi thất bại',
  },
}

// Home-page copy left untranslated by an earlier UI change. The values were
// missing from these locales; fill them so i18n sync never copies Chinese into
// an English/French/Japanese/Russian/Vietnamese bundle.
const homePageKeys = {
  en: {
    '500+ Large Models Integrated': '500+ Large Models Integrated',
    'Advanced architecture ensures API stability and high availability.':
      'Advanced architecture ensures API stability and high availability.',
    'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.':
      'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.',
    'Auto Failover': 'Auto Failover',
    'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.':
      'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.',
    'Built for production,': 'Built for production,',
    'Compatible API Routes': 'Compatible API Routes',
    'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.':
      'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.',
    'Core Capabilities': 'Core Capabilities',
    'Cost Alerts': 'Cost Alerts',
    'Docs & Guides': 'Docs & Guides',
    'Easier to implement': 'Easier to implement',
    'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.':
      'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.',
    'Everything you need to': 'Everything you need to',
    'Extensive support': 'Extensive support',
    'Extensive Support': 'Extensive Support',
    'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.':
      'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.',
    'Health Checks': 'Health Checks',
    'High stability': 'High stability',
    'High Stability': 'High Stability',
    'High-Availability Access': 'High-Availability Access',
    'Large Models Integrated': 'Large Models Integrated',
    'Lower price': 'Lower price',
    'Model Support': 'Model Support',
    'Multi-protocol': 'Multi-protocol',
    'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.':
      'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.',
    'Multimodal understanding': 'Multimodal understanding',
    'Multimodal understanding in progress...':
      'Multimodal understanding in progress...',
    'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.':
      'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.',
    'Our Advantage': 'Our Advantage',
    'Pay-as-you-go': 'Pay-as-you-go',
    'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.':
      'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.',
    Professional: 'Professional',
    'Professional Operations': 'Professional Operations',
    'Real-time Billing': 'Real-time Billing',
    'Retry Logic': 'Retry Logic',
    'SDK Ready': 'SDK Ready',
    'Service Guarantee': 'Service Guarantee',
    'Service Uptime': 'Service Uptime',
    'ship AI products': 'ship AI products',
    'Stronger model': 'Stronger model',
    'trusted at scale': 'trusted at scale',
    'Ultra-high concurrency': 'Ultra-high concurrency',
    'Upstream Services': 'Upstream Services',
    'Usage Reports': 'Usage Reports',
  },
  fr: {
    '500+ Large Models Integrated': 'Plus de 500 grands modèles intégrés',
    'Advanced architecture ensures API stability and high availability.':
      'Une architecture avancée garantit la stabilité et la haute disponibilité de l\'API.',
    'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.':
      'Une architecture avancée d\'ordonnancement, de routage et de cache maintient votre API stable et hautement disponible sous toute charge.',
    'Auto Failover': 'Basculement automatique',
    'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.':
      'Le basculement automatique entre plusieurs fournisseurs en amont garantit un service ininterrompu même si certains canaux échouent.',
    'Built for production,': 'Conçu pour la production,',
    'Compatible API Routes': 'Routes API compatibles',
    'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.':
      'Compatible avec OpenAI, Claude, Gemini et des dizaines d\'autres protocoles. Remplace directement vos intégrations existantes.',
    'Core Capabilities': 'Capacités principales',
    'Cost Alerts': 'Alertes de coût',
    'Docs & Guides': 'Documentation et guides',
    'Easier to implement': 'Plus simple à intégrer',
    'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.':
      'Un SLA de niveau entreprise avec basculement automatique et surveillance en temps réel garantit un service stable et fiable 24 h/24.',
    'Everything you need to': 'Tout ce qu\'il vous faut pour',
    'Extensive support': 'Prise en charge étendue',
    'Extensive Support': 'Prise en charge étendue',
    'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.':
      'Facturation flexible sans engagement initial. Rechargez à la demande et ne payez que les tokens réellement consommés.',
    'Health Checks': 'Contrôles de santé',
    'High stability': 'Haute stabilité',
    'High Stability': 'Haute stabilité',
    'High-Availability Access': 'Accès haute disponibilité',
    'Large Models Integrated': 'Grands modèles intégrés',
    'Lower price': 'Prix plus bas',
    'Model Support': 'Prise en charge des modèles',
    'Multi-protocol': 'Multi-protocole',
    'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.':
      'Un déploiement multi-régions avec équilibrage de charge intelligent maintient le flux de vos requêtes API même en période de pointe.',
    'Multimodal understanding': 'Compréhension multimodale',
    'Multimodal understanding in progress...':
      'Compréhension multimodale en cours...',
    'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.':
      'Accédez en un seul endroit aux grands modèles de langage, modèles multimodaux et modèles open source via une API unifiée.',
    'Our Advantage': 'Nos avantages',
    'Pay-as-you-go': 'Paiement à l\'usage',
    'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.':
      'Paiement à l\'usage sans frais cachés. Le suivi en temps réel et les rapports détaillés permettent de justifier chaque token.',
    Professional: 'Professionnel',
    'Professional Operations': 'Opérations professionnelles',
    'Real-time Billing': 'Facturation en temps réel',
    'Retry Logic': 'Logique de nouvelle tentative',
    'SDK Ready': 'SDK prêt à l\'emploi',
    'Service Guarantee': 'Garantie de service',
    'Service Uptime': 'Disponibilité du service',
    'ship AI products': 'lancer vos produits IA',
    'Stronger model': 'Modèle plus puissant',
    'trusted at scale': 'fiable à grande échelle',
    'Ultra-high concurrency': 'Concurrence ultra-élevée',
    'Upstream Services': 'Services en amont',
    'Usage Reports': 'Rapports d\'utilisation',
  },
  ja: {
    '500+ Large Models Integrated': '500以上の大規模モデルを統合',
    'Advanced architecture ensures API stability and high availability.':
      '高度なアーキテクチャが API の安定性と高可用性を実現します。',
    'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.':
      '高度なスケジューリング、ルーティング、キャッシュ機構により、あらゆる負荷下でも API の安定性と高可用性を維持します。',
    'Auto Failover': '自動フェイルオーバー',
    'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.':
      '複数の上流プロバイダー間の自動フェイルオーバーにより、個々のチャネルに障害が発生してもサービスを継続できます。',
    'Built for production,': '本番環境向けに設計、',
    'Compatible API Routes': '互換 API ルート',
    'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.':
      'OpenAI、Claude、Gemini など数十種類のプロトコルに対応。既存の統合をそのまま置き換えられます。',
    'Core Capabilities': '主要機能',
    'Cost Alerts': 'コストアラート',
    'Docs & Guides': 'ドキュメントとガイド',
    'Easier to implement': '導入が簡単',
    'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.':
      'エンタープライズグレードの SLA と自動フェイルオーバー、リアルタイム監視により、24時間安定した信頼性の高いサービスを提供します。',
    'Everything you need to': '必要なすべてを',
    'Extensive support': '幅広いサポート',
    'Extensive Support': '幅広いサポート',
    'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.':
      '前払い不要の柔軟な課金。必要なときにチャージし、実際に消費したトークン分だけ支払います。',
    'Health Checks': 'ヘルスチェック',
    'High stability': '高い安定性',
    'High Stability': '高い安定性',
    'High-Availability Access': '高可用アクセス',
    'Large Models Integrated': '統合された大規模モデル',
    'Lower price': '低価格',
    'Model Support': 'モデル対応',
    'Multi-protocol': 'マルチプロトコル',
    'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.':
      'インテリジェントな負荷分散を備えたマルチリージョン展開により、ピーク時のトラフィックでも API リクエストをスムーズに処理します。',
    'Multimodal understanding': 'マルチモーダル理解',
    'Multimodal understanding in progress...':
      'マルチモーダル理解を実行中...',
    'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.':
      '統一 API を通じて、主要な大規模言語モデル、マルチモーダルモデル、オープンソースモデルにワンストップでアクセスできます。',
    'Our Advantage': '私たちの強み',
    'Pay-as-you-go': '従量課金',
    'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.':
      '隠れた料金のない従量課金。リアルタイムの使用量追跡と詳細なコストレポートで、すべてのトークンを明確に管理できます。',
    Professional: 'プロフェッショナル',
    'Professional Operations': 'プロフェッショナルな運用',
    'Real-time Billing': 'リアルタイム課金',
    'Retry Logic': '再試行ロジック',
    'SDK Ready': 'すぐに使える SDK',
    'Service Guarantee': 'サービス保証',
    'Service Uptime': 'サービス稼働率',
    'ship AI products': 'AI プロダクトを迅速にリリース',
    'Stronger model': 'より強力なモデル',
    'trusted at scale': '大規模でも信頼',
    'Ultra-high concurrency': '超高並列処理',
    'Upstream Services': '上流サービス',
    'Usage Reports': '使用量レポート',
  },
  ru: {
    '500+ Large Models Integrated': 'Более 500 больших моделей',
    'Advanced architecture ensures API stability and high availability.':
      'Продуманная архитектура обеспечивает стабильность и высокую доступность API.',
    'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.':
      'Продуманная архитектура планирования, маршрутизации и кэширования сохраняет стабильность и высокую доступность API при любой нагрузке.',
    'Auto Failover': 'Автоматическое переключение',
    'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.':
      'Автоматическое переключение между несколькими вышестоящими провайдерами обеспечивает бесперебойную работу даже при сбое отдельных каналов.',
    'Built for production,': 'Создано для продакшена,',
    'Compatible API Routes': 'Совместимые маршруты API',
    'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.':
      'Поддержка OpenAI, Claude, Gemini и десятков других протоколов. Прямая замена существующих интеграций.',
    'Core Capabilities': 'Ключевые возможности',
    'Cost Alerts': 'Оповещения о расходах',
    'Docs & Guides': 'Документация и руководства',
    'Easier to implement': 'Проще внедрить',
    'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.':
      'SLA корпоративного уровня с автоматическим переключением и мониторингом в реальном времени обеспечивает стабильную и надёжную работу круглосуточно.',
    'Everything you need to': 'Всё необходимое, чтобы',
    'Extensive support': 'Широкая поддержка',
    'Extensive Support': 'Широкая поддержка',
    'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.':
      'Гибкая оплата без предоплаты. Пополняйте по мере необходимости и платите только за фактически использованные токены.',
    'Health Checks': 'Проверки состояния',
    'High stability': 'Высокая стабильность',
    'High Stability': 'Высокая стабильность',
    'High-Availability Access': 'Доступ с высокой доступностью',
    'Large Models Integrated': 'Интегрированные большие модели',
    'Lower price': 'Более низкая цена',
    'Model Support': 'Поддержка моделей',
    'Multi-protocol': 'Мультипротокол',
    'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.':
      'Развёртывание в нескольких регионах с интеллектуальной балансировкой нагрузки обеспечивает плавную обработку запросов API даже при пиковых нагрузках.',
    'Multimodal understanding': 'Мультимодальное понимание',
    'Multimodal understanding in progress...':
      'Выполняется мультимодальное понимание...',
    'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.':
      'Единый API для доступа к основным большим языковым моделям, мультимодальным и открытым моделям.',
    'Our Advantage': 'Наши преимущества',
    'Pay-as-you-go': 'Оплата по мере использования',
    'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.':
      'Оплата по мере использования без скрытых платежей. Отслеживание в реальном времени и подробные отчёты по расходам учитывают каждый токен.',
    Professional: 'Профессионально',
    'Professional Operations': 'Профессиональная эксплуатация',
    'Real-time Billing': 'Биллинг в реальном времени',
    'Retry Logic': 'Логика повторов',
    'SDK Ready': 'Готовый SDK',
    'Service Guarantee': 'Гарантия обслуживания',
    'Service Uptime': 'Доступность сервиса',
    'ship AI products': 'выпускать AI-продукты',
    'Stronger model': 'Более сильная модель',
    'trusted at scale': 'надёжно при масштабировании',
    'Ultra-high concurrency': 'Сверхвысокая конкурентность',
    'Upstream Services': 'Вышестоящие сервисы',
    'Usage Reports': 'Отчёты об использовании',
  },
  vi: {
    '500+ Large Models Integrated': 'Tích hợp hơn 500 mô hình lớn',
    'Advanced architecture ensures API stability and high availability.':
      'Kiến trúc tiên tiến đảm bảo API ổn định và có tính sẵn sàng cao.',
    'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.':
      'Kiến trúc lập lịch, định tuyến và bộ nhớ đệm tiên tiến giúp API luôn ổn định và sẵn sàng cao dưới mọi tải.',
    'Auto Failover': 'Chuyển đổi dự phòng tự động',
    'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.':
      'Chuyển đổi dự phòng tự động giữa nhiều nhà cung cấp thượng nguồn đảm bảo dịch vụ không bị gián đoạn ngay cả khi một kênh gặp sự cố.',
    'Built for production,': 'Được xây dựng cho môi trường production,',
    'Compatible API Routes': 'Các tuyến API tương thích',
    'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.':
      'Tương thích với OpenAI, Claude, Gemini và hàng chục giao thức khác. Thay thế trực tiếp các tích hợp hiện có.',
    'Core Capabilities': 'Năng lực cốt lõi',
    'Cost Alerts': 'Cảnh báo chi phí',
    'Docs & Guides': 'Tài liệu và hướng dẫn',
    'Easier to implement': 'Dễ triển khai hơn',
    'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.':
      'SLA cấp doanh nghiệp cùng chuyển đổi dự phòng tự động và giám sát thời gian thực đảm bảo dịch vụ ổn định, đáng tin cậy 24/7.',
    'Everything you need to': 'Mọi thứ bạn cần để',
    'Extensive support': 'Hỗ trợ rộng rãi',
    'Extensive Support': 'Hỗ trợ rộng rãi',
    'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.':
      'Thanh toán linh hoạt, không cần trả trước. Nạp tiền khi cần và chỉ trả cho lượng token thực tế đã dùng.',
    'Health Checks': 'Kiểm tra sức khỏe',
    'High stability': 'Độ ổn định cao',
    'High Stability': 'Độ ổn định cao',
    'High-Availability Access': 'Truy cập có tính sẵn sàng cao',
    'Large Models Integrated': 'Mô hình lớn được tích hợp',
    'Lower price': 'Giá thấp hơn',
    'Model Support': 'Hỗ trợ mô hình',
    'Multi-protocol': 'Đa giao thức',
    'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.':
      'Triển khai đa vùng với cân bằng tải thông minh giúp các yêu cầu API luôn được xử lý mượt mà ngay cả khi lưu lượng cao điểm.',
    'Multimodal understanding': 'Hiểu đa phương thức',
    'Multimodal understanding in progress...':
      'Đang hiểu đa phương thức...',
    'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.':
      'Truy cập một cửa các mô hình ngôn ngữ lớn, mô hình đa phương thức và mô hình mã nguồn mở qua một API thống nhất.',
    'Our Advantage': 'Lợi thế của chúng tôi',
    'Pay-as-you-go': 'Trả tiền theo mức sử dụng',
    'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.':
      'Trả tiền theo mức sử dụng, không phí ẩn. Theo dõi thời gian thực và báo cáo chi phí chi tiết giúp kiểm soát từng token.',
    Professional: 'Chuyên nghiệp',
    'Professional Operations': 'Vận hành chuyên nghiệp',
    'Real-time Billing': 'Thanh toán thời gian thực',
    'Retry Logic': 'Cơ chế thử lại',
    'SDK Ready': 'SDK sẵn sàng',
    'Service Guarantee': 'Cam kết dịch vụ',
    'Service Uptime': 'Thời gian hoạt động của dịch vụ',
    'ship AI products': 'đưa sản phẩm AI ra mắt',
    'Stronger model': 'Mô hình mạnh hơn',
    'trusted at scale': 'đáng tin cậy ở quy mô lớn',
    'Ultra-high concurrency': 'Đồng thời siêu cao',
    'Upstream Services': 'Dịch vụ thượng nguồn',
    'Usage Reports': 'Báo cáo sử dụng',
  },
}

for (const [locale, translations] of Object.entries(homePageKeys)) {
  Object.assign(newKeys[locale], translations)
}

const feedbackIdentityKeys = {
  en: { 'Deleted user': 'Deleted user' },
  zh: { 'Deleted user': '已注销' },
  'zh-TW': { 'Deleted user': '已註銷' },
  fr: { 'Deleted user': 'Utilisateur supprimé' },
  ja: { 'Deleted user': '削除済みユーザー' },
  ru: { 'Deleted user': 'Удалённый пользователь' },
  vi: { 'Deleted user': 'Người dùng đã xóa' },
}

for (const [locale, translations] of Object.entries(feedbackIdentityKeys)) {
  Object.assign(newKeys[locale], translations)
}

async function main() {
  let totalAdded = 0

  for (const [locale, trans] of Object.entries(newKeys)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    const json = JSON.parse(await fs.readFile(filePath, 'utf8'))

    let count = 0
    for (const [key, value] of Object.entries(trans)) {
      if (!Object.prototype.hasOwnProperty.call(json.translation, key)) {
        json.translation[key] = value
        count++
      } else if (json.translation[key] !== value) {
        json.translation[key] = value
        count++
      }
    }

    if (count > 0) {
      json.translation = Object.fromEntries(
        Object.entries(json.translation).sort(([a], [b]) => a.localeCompare(b))
      )
      await fs.writeFile(filePath, stableStringify(json), 'utf8')
    }

    console.log(`${locale}: ${count} translations applied`)
    totalAdded += count
  }

  console.log(`\nTotal: ${totalAdded} translations applied`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
