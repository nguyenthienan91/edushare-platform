`pages/` là nơi ráp màn hình hoàn chỉnh.
Còn `components/` là những phần UI nhỏ hơn được tái sử dụng nhiều lần.

Trong dự án kiểu SaaS như EduShare thì chia như vậy là để:

* dễ scale
* dễ reuse
* AI generate code không bị loạn
* backend/frontend mapping rõ hơn

---

# 1. `components/ui/`

Đây là:

> design system cơ bản

Chứa các component “generic” không liên quan business.

Ví dụ:

```txt
components/ui/
 ├── button.tsx
 ├── input.tsx
 ├── modal.tsx
 ├── badge.tsx
 ├── card.tsx
 ├── table.tsx
 ├── tabs.tsx
 ├── dropdown.tsx
 └── skeleton.tsx
```

## Đặc điểm

* tái sử dụng toàn app
* không chứa logic business
* chỉ UI thuần

Ví dụ:

* Button đỏ/xanh
* Modal popup
* Card container

---

# 2. `components/shared/`

Đây là:

> component dùng chung nhiều page nhưng có context của app

Ví dụ:

```txt
components/shared/
 ├── navbar.tsx
 ├── sidebar.tsx
 ├── user-avatar.tsx
 ├── notification-bell.tsx
 ├── empty-state.tsx
 ├── page-header.tsx
 └── loading-overlay.tsx
```

## Khác gì với `ui/`?

`shared/`

* có context của EduShare
* biết user/login/layout
* dùng ở nhiều feature

Ví dụ:

* sidebar dashboard
* top navigation
* user profile dropdown

---

# 3. `components/group/`

Đây là:

> component liên quan nghiệp vụ Group

Ví dụ:

```txt
components/group/
 ├── group-card.tsx
 ├── group-detail.tsx
 ├── group-members.tsx
 ├── group-status-badge.tsx
 ├── group-search-filter.tsx
 ├── create-group-form.tsx
 └── group-slot-progress.tsx
```

## Đây là business component

Ví dụ:

### `group-card.tsx`

Hiển thị:

* tên nhóm
* giá
* slot còn lại
* trust score
* category

=> component này chỉ tồn tại trong domain “group”.

---

# 4. `components/escrow/`

Đây là:

> component liên quan transaction & payment

Và đây là:

## CORE BUSINESS của EduShare

Ví dụ:

```txt
components/escrow/
 ├── escrow-status.tsx
 ├── payment-summary.tsx
 ├── transaction-timeline.tsx
 ├── evidence-upload.tsx
 ├── withdrawal-form.tsx
 ├── dispute-form.tsx
 └── escrow-warning.tsx
```

---

# Ví dụ dễ hiểu

## `transaction-timeline.tsx`

Hiển thị:

```txt
Payment Submitted
   ↓
Owner Accepted
   ↓
Evidence Uploaded
   ↓
24h Protection
   ↓
Money Released
```

---

## `evidence-upload.tsx`

Chứa:

* upload image
* preview image
* status verification

---

# Tư duy quan trọng

## `ui/`

= generic

## `shared/`

= app-wide reusable

## `group/`

= business domain

## `escrow/`

= core business domain

---

# So sánh thực tế

Ví dụ:

## Button

```tsx
<Button />
```

=> `ui/`

---

## Sidebar dashboard

```tsx
<DashboardSidebar />
```

=> `shared/`

---

## Card hiển thị group Canva

```tsx
<GroupCard />
```

=> `group/`

---

## Timeline giao dịch escrow

```tsx
<TransactionTimeline />
```

=> `escrow/`

---

# Tại sao phải chia domain kiểu này?

Vì sau này:

* code không loạn
* dễ onboarding member mới
* dễ maintain
* AI generate đúng context hơn

---

# Nếu không chia sẽ thành gì?

```txt
components/
 ├── button.tsx
 ├── modal.tsx
 ├── abc.tsx
 ├── groupCard2.tsx
 ├── finalModal.tsx
 ├── newCard.tsx
```

=> 2 tháng sau:

* không ai hiểu gì
* duplicate component
* merge conflict

---

# Với EduShare tôi khuyên structure này

```txt
src/
 ├── pages/
 │
 ├── components/
 │    ├── ui/
 │    ├── shared/
 │    ├── auth/
 │    ├── group/
 │    ├── escrow/
 │    ├── dashboard/
 │    └── admin/
 │
 ├── layouts/
 ├── services/
 ├── hooks/
 ├── store/
 ├── types/
 └── utils/
```

---

# Bonus — cách biết component nên nằm đâu

## Hỏi 3 câu:

### 1. Có reusable toàn app không?

=> `ui/`

---

### 2. Có reusable nhiều page trong app không?

=> `shared/`

---

### 3. Có gắn với business domain không?

=> domain folder (`group/`, `escrow/`, `admin/`)

---

# Ví dụ cuối cùng cực dễ hiểu

## Trang Explore Groups

```txt
pages/member/explore.tsx
```

Sẽ ráp:

```tsx
<PageHeader />
<GroupSearchFilter />
<GroupCard />
<GroupCard />
<GroupCard />
<Pagination />
```

Trong đó:

| Component         | Folder |
| ----------------- | ------ |
| PageHeader        | shared |
| GroupSearchFilter | group  |
| GroupCard         | group  |
| Pagination        | ui     |

Đó chính là kiến trúc component-based thực tế trong React SaaS project.
