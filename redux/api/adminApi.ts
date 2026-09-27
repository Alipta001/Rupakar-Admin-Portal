import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import axiosInstance from '@/api/axios/axios'
import { ENDPOINTS } from '@/api/endPoints/endPoints'
import { DashboardOverviewData } from '@/types/dashboard'
import { User } from '@/types/user'
import { Vendor } from '@/types/vendor'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/category'
import { Order } from '@/types/order'
import { Payment, Refund } from '@/types/payment'
import { InventoryItem } from '@/types/inventory'
import { Commission, Payout, Invoice } from '@/types/finance'
import { AuthenticityRecord } from '@/types/authenticity'
import { Coupon } from '@/types/coupon'
import { Review } from '@/types/review'
import { AdminNotification } from '@/types/notification'
import { AnalyticsData } from '@/types/analytics'
import { AuditLog } from '@/types/audit'
import { SupportTicket } from '@/types/support'
import { PlatformSettings } from '@/types/settings'
import { AdminUser } from '@/types/auth'

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  category?: string
  role?: string
  range?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
      headers?: AxiosRequestConfig['headers']
    },
    unknown,
    { status?: number; data?: unknown; message?: string }
  > =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      })
      // Return unwrapped data payload or root response
      const payload = result.data?.data !== undefined ? result.data.data : result.data
      return { data: payload }
    } catch (axiosError) {
      const err = axiosError as AxiosError<{ message?: string; error?: string; errors?: unknown }>
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data,
          message:
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'API request failed',
        },
      }
    }
  }

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Dashboard',
    'Users',
    'Vendors',
    'Products',
    'Categories',
    'Brands',
    'Orders',
    'Payments',
    'Refunds',
    'Inventory',
    'Commissions',
    'Payouts',
    'Invoices',
    'Authenticity',
    'Coupons',
    'Reviews',
    'Notifications',
    'Analytics',
    'AuditLogs',
    'Support',
    'Profile',
    'Settings',
  ],
  endpoints: (builder) => ({
    // 1. Dashboard
    getDashboardOverview: builder.query<DashboardOverviewData, { range?: string } | void>({
      query: (params) => ({
        url: ENDPOINTS.DASHBOARD.OVERVIEW,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Dashboard'],
    }),

    // 2. Users
    getUsers: builder.query<PaginatedResult<User>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.USERS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: ENDPOINTS.USERS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    updateUserStatus: builder.mutation<User, { id: string; status: string; reason?: string }>({
      query: ({ id, status, reason }) => ({
        url: ENDPOINTS.USERS.UPDATE_STATUS(id),
        method: 'PATCH',
        data: { status, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    // 3. Vendors
    getVendors: builder.query<PaginatedResult<Vendor>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.VENDORS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Vendors' as const, id })),
              { type: 'Vendors', id: 'LIST' },
            ]
          : [{ type: 'Vendors', id: 'LIST' }],
    }),
    getVendorById: builder.query<Vendor, string>({
      query: (id) => ({
        url: ENDPOINTS.VENDORS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Vendors', id }],
    }),
    approveVendor: builder.mutation<Vendor, { id: string; commissionRate?: number }>({
      query: ({ id, commissionRate }) => ({
        url: ENDPOINTS.VENDORS.APPROVE(id),
        method: 'PATCH',
        data: { commissionRate },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Vendors', id },
        { type: 'Vendors', id: 'LIST' },
        'Dashboard',
      ],
    }),
    rejectVendor: builder.mutation<Vendor, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: ENDPOINTS.VENDORS.REJECT(id),
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Vendors', id },
        { type: 'Vendors', id: 'LIST' },
        'Dashboard',
      ],
    }),
    suspendVendor: builder.mutation<Vendor, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: ENDPOINTS.VENDORS.SUSPEND(id),
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Vendors', id },
        { type: 'Vendors', id: 'LIST' },
      ],
    }),
    restoreVendor: builder.mutation<Vendor, { id: string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.VENDORS.RESTORE(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Vendors', id },
        { type: 'Vendors', id: 'LIST' },
      ],
    }),

    // 4. Products
    getProducts: builder.query<PaginatedResult<Product>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.PRODUCTS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => ({
        url: ENDPOINTS.PRODUCTS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),
    approveProduct: builder.mutation<Product, { id: string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.PRODUCTS.APPROVE(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        'Dashboard',
      ],
    }),
    rejectProduct: builder.mutation<Product, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: ENDPOINTS.PRODUCTS.REJECT(id),
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        'Dashboard',
      ],
    }),
    publishProduct: builder.mutation<Product, { id: string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.PRODUCTS.PUBLISH(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        'Dashboard',
      ],
    }),
    unpublishProduct: builder.mutation<Product, { id: string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.PRODUCTS.UNPUBLISH(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    archiveProduct: builder.mutation<Product, { id: string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.PRODUCTS.ARCHIVE(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    // 5. Categories
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: ENDPOINTS.CATEGORIES.LIST,
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (data) => ({
        url: ENDPOINTS.CATEGORIES.CREATE,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.CATEGORIES.UPDATE(id),
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: ENDPOINTS.CATEGORIES.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    // 6. Brands
    getBrands: builder.query<Brand[], void>({
      query: () => ({
        url: ENDPOINTS.BRANDS.LIST,
        method: 'GET',
      }),
      providesTags: ['Brands'],
    }),
    createBrand: builder.mutation<Brand, Partial<Brand>>({
      query: (data) => ({
        url: ENDPOINTS.BRANDS.CREATE,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Brands'],
    }),
    updateBrand: builder.mutation<Brand, { id: string; data: Partial<Brand> }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.BRANDS.UPDATE(id),
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Brands'],
    }),
    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({
        url: ENDPOINTS.BRANDS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Brands'],
    }),

    // 7. Orders
    getOrders: builder.query<PaginatedResult<Order>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.ORDERS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Orders' as const, id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => ({
        url: ENDPOINTS.ORDERS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    // 8. Payments
    getPayments: builder.query<PaginatedResult<Payment>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.PAYMENTS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Payments'],
    }),

    // 9. Refunds
    getRefunds: builder.query<PaginatedResult<Refund>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.REFUNDS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Refunds'],
    }),

    // 10. Inventory
    getInventory: builder.query<PaginatedResult<InventoryItem>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.INVENTORY.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Inventory'],
    }),

    // 11. Commissions
    getCommissions: builder.query<PaginatedResult<Commission>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.COMMISSIONS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Commissions'],
    }),
    getCommissionConfigs: builder.query<unknown[], void>({
      query: () => ({
        url: ENDPOINTS.COMMISSIONS.CONFIGS,
        method: 'GET',
      }),
      providesTags: ['Commissions'],
    }),
    createCommissionConfig: builder.mutation<unknown, Record<string, unknown>>({
      query: (data) => ({
        url: ENDPOINTS.COMMISSIONS.CREATE_CONFIG,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Commissions'],
    }),

    // 12. Payouts
    getPayouts: builder.query<PaginatedResult<Payout>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.PAYOUTS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Payouts'],
    }),

    // 13. Invoices
    getInvoices: builder.query<PaginatedResult<Invoice>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.INVOICES.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Invoices'],
    }),
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => ({
        url: ENDPOINTS.INVOICES.DETAIL(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Invoices', id }],
    }),

    // 14. Authenticity
    getAuthenticityRecords: builder.query<PaginatedResult<AuthenticityRecord>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.AUTHENTICITY.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Authenticity'],
    }),
    verifyAuthenticityRecord: builder.mutation<
      AuthenticityRecord,
      { id: string; status: 'VERIFIED' | 'REJECTED'; verificationNotes?: string; certificateNumber?: string }
    >({
      query: ({ id, ...data }) => ({
        url: ENDPOINTS.AUTHENTICITY.VERIFY(id),
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Authenticity'],
    }),

    // 15. Coupons
    getCoupons: builder.query<PaginatedResult<Coupon>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.COUPONS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Coupons'],
    }),
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (data) => ({
        url: ENDPOINTS.COUPONS.CREATE,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Coupons'],
    }),
    updateCouponStatus: builder.mutation<Coupon, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: ENDPOINTS.COUPONS.UPDATE_STATUS(id),
        method: 'PATCH',
        data: { isActive },
      }),
      invalidatesTags: ['Coupons'],
    }),

    // 16. Reviews
    getReviews: builder.query<PaginatedResult<Review>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.REVIEWS.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Reviews'],
    }),
    updateReviewStatus: builder.mutation<Review, { id: string; status: 'APPROVED' | 'REJECTED' }>({
      query: ({ id, status }) => ({
        url: ENDPOINTS.REVIEWS.UPDATE_STATUS(id),
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['Reviews'],
    }),

    // 17. Notifications
    getNotifications: builder.query<AdminNotification[], void>({
      query: () => ({
        url: ENDPOINTS.NOTIFICATIONS.LIST,
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // 18. Analytics
    getAnalytics: builder.query<AnalyticsData, { range?: string } | void>({
      query: (params) => ({
        url: ENDPOINTS.ANALYTICS.OVERVIEW,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Analytics'],
    }),

    // 19. Audit Logs
    getAuditLogs: builder.query<PaginatedResult<AuditLog>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.AUDIT.LIST,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['AuditLogs'],
    }),

    // 20. Support
    getSupportTickets: builder.query<PaginatedResult<SupportTicket>, QueryParams | void>({
      query: (params) => ({
        url: ENDPOINTS.SUPPORT.TICKETS,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Support'],
    }),
    updateSupportTicket: builder.mutation<
      SupportTicket,
      { ticketId: string; status?: string; responseMessage?: string; priority?: string }
    >({
      query: ({ ticketId, ...data }) => ({
        url: ENDPOINTS.SUPPORT.UPDATE_TICKET(ticketId),
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Support'],
    }),

    // 21. Profile
    getProfile: builder.query<AdminUser, void>({
      query: () => ({
        url: ENDPOINTS.PROFILE.ME,
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<AdminUser, Partial<AdminUser>>({
      query: (data) => ({
        url: ENDPOINTS.PROFILE.UPDATE,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // 22. Settings
    getSettings: builder.query<PlatformSettings, void>({
      query: () => ({
        url: ENDPOINTS.SETTINGS.GET,
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),

    // Auth endpoints
    login: builder.mutation<
      { accessToken: string; user: AdminUser },
      { email: string; password?: string }
    >({
      query: (credentials) => ({
        url: ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Profile', 'Dashboard'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetDashboardOverviewQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
  useRestoreVendorMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  usePublishProductMutation,
  useUnpublishProductMutation,
  useArchiveProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetPaymentsQuery,
  useGetRefundsQuery,
  useGetInventoryQuery,
  useGetCommissionsQuery,
  useGetCommissionConfigsQuery,
  useCreateCommissionConfigMutation,
  useGetPayoutsQuery,
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetAuthenticityRecordsQuery,
  useVerifyAuthenticityRecordMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponStatusMutation,
  useGetReviewsQuery,
  useUpdateReviewStatusMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetAnalyticsQuery,
  useGetAuditLogsQuery,
  useGetSupportTicketsQuery,
  useUpdateSupportTicketMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSettingsQuery,
  useLoginMutation,
  useLogoutMutation,
} = adminApi
