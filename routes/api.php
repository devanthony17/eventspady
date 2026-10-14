<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Category 1: Authentication & Authorization
Route::prefix('auth')->group(function () {
    Route::post('/register', 'AuthController@register');
    Route::post('/login', 'AuthController@login');
    Route::post('/google', 'AuthController@google');
    Route::post('/forgot-password', 'AuthController@forgotPassword');
    Route::post('/reset-password', 'AuthController@resetPassword');
    Route::post('/refresh-token', 'AuthController@refreshToken');
    Route::post('/logout', 'AuthController@logout')->middleware('auth:api');
    Route::get('/me', 'AuthController@me')->middleware('auth:api');
});

// Category 2: Public Event Discovery & Search
Route::get('/events', 'EventController@index');
Route::get('/events/search', 'EventController@search');
Route::get('/events/{slugOrId}', 'EventController@show');
Route::get('/events/{id}/reviews', 'EventReviewController@index');
Route::get('/categories', 'CategoryController@index');
Route::get('/organizers', 'OrganizerController@index');
Route::get('/organizers/{id}', 'OrganizerController@show');
Route::get('/locations', 'LocationController@index');
Route::post('/events', 'AdminEventController@store');
Route::put('/events/{id}', 'AdminEventController@update');

// Category 3: Content (Public)
Route::get('/blogs', 'BlogController@index');
Route::get('/blog/{slug}', 'BlogController@show');
Route::post('/newsletter/subscribe', 'NewsletterController@subscribe');
Route::post('/contact', 'ContactController@submit');
Route::post('/feedback', 'FeedbackController@submit');
Route::get('/cms', 'CmsController@landing');
Route::get('/faq', 'CmsController@faq');
Route::get('/plans', 'CmsController@plans');

// Category 4: Users (Authenticated)
Route::prefix('users')->middleware('auth:api')->group(function () {
    Route::get('/overview', 'UserController@overview');
    Route::get('/settings', 'UserController@settings');
    Route::patch('/settings', 'UserController@updateSettings');
    Route::patch('/profile', 'UserController@updateProfile');
    Route::post('/avatar', 'UserController@uploadAvatar');
    Route::patch('/password', 'UserController@updatePassword');
    Route::get('/notifications', 'UserController@notifications');
    Route::patch('/notifications/{id}/read', 'UserController@readNotification');
    Route::post('/notifications/read-all', 'UserController@readAllNotifications');
    Route::get('/wallet', 'WalletController@index');
    Route::get('/wallet/transactions', 'WalletController@transactions');
    Route::post('/wallet/topup', 'WalletController@topup');
    Route::get('/gate-status', 'UserController@gateStatus');
    Route::get('/tickets', 'TicketController@userTickets');
});

// Category 5: Booking & Ticketing
Route::middleware('auth:api')->group(function () {
    Route::get('/wishlist', 'WishlistController@index');
    Route::delete('/wishlist', 'WishlistController@clear');
    Route::post('/wishlist/{eventId}', 'WishlistController@store');
    Route::delete('/wishlist/{eventId}', 'WishlistController@destroy');
    
    Route::post('/events/{id}/report', 'EventController@report');
    Route::post('/events/{id}/inquiries', 'EventController@inquire');
    Route::post('/events/{id}/reviews', 'EventReviewController@store');
    
    Route::post('/orders/checkout', 'OrderController@checkout');
    Route::post('/payments/paystack/initialize', 'PaymentController@paystackInitialize');
    Route::get('/payments/paystack/verify/{reference}', 'PaymentController@paystackVerify');
    Route::post('/payments/flutterwave/initialize', 'PaymentController@flutterwaveInitialize');
    Route::get('/payments/flutterwave/verify/{tx_ref}', 'PaymentController@flutterwaveVerify');
    Route::post('/payments/momo/ussd-prompt', 'PaymentController@momoUssdPrompt');
    Route::get('/orders/{orderId}', 'OrderController@show');
    Route::get('/orders/{orderId}/tickets.pdf', 'OrderController@downloadPdf');
    Route::get('/orders/{orderId}/calendar.ics', 'OrderController@downloadIcs');
    
    Route::post('/tickets/{ticketCode}/transfer', 'TicketController@transfer');
});
Route::post('/coupons/validate', 'CouponController@validateCoupon');
Route::post('/payments/webhook', 'PaymentController@webhook'); // Public for provider

// Category 6: Organizer Platform & Operations
Route::prefix('organizer')->middleware('auth:api')->group(function () {
    Route::get('/overview', 'OrganizerPlatformController@overview');
    
    Route::get('/events', 'OrganizerEventController@index');
    Route::get('/events/drafts', 'OrganizerEventController@drafts');
    Route::delete('/events/drafts/{id}', 'OrganizerEventController@deleteDraft');
    Route::get('/events/{id}/analytics', 'OrganizerEventController@analytics');
    Route::post('/events', 'OrganizerEventController@store');
    Route::post('/events/draft', 'OrganizerEventController@draft');
    Route::put('/events/{id}', 'OrganizerEventController@update');
    Route::patch('/events/{id}/unpublish', 'OrganizerEventController@unpublish');
    Route::delete('/events/{id}', 'OrganizerEventController@destroy');
    
    Route::post('/media/upload', 'MediaController@upload');
    
    Route::get('/orders', 'OrganizerOrderController@index');
    Route::get('/orders/export-csv', 'OrganizerOrderController@exportCsv');
    
    Route::get('/coupons', 'OrganizerCouponController@index');
    Route::post('/coupons', 'OrganizerCouponController@store');
    Route::delete('/coupons/{id}', 'OrganizerCouponController@destroy');
    
    Route::get('/guests', 'OrganizerGuestController@index');
    Route::get('/guests/export-csv', 'OrganizerGuestController@exportCsv');
    Route::post('/guests/comps', 'OrganizerGuestController@issueComps');
    
    Route::post('/scanner/check-in', 'ScannerController@checkIn');
    Route::delete('/scanner/check-in/{ticketCode}', 'ScannerController@undoCheckIn');
    Route::post('/gate-violations', 'GateViolationController@store');
    
    Route::get('/payouts', 'PayoutController@index');
    Route::post('/payouts/request', 'PayoutController@request');
});

// Category 7: Admin Console & Platform Governance
Route::prefix('admin')->middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/overview', 'AdminController@overview');
    
    Route::get('/organizers', 'AdminOrganizerController@index');
    Route::patch('/organizers/{id}/commission', 'AdminOrganizerController@updateCommission');
    Route::patch('/organizers/{id}/verify', 'AdminOrganizerController@verify');
    Route::patch('/organizers/{id}/reject', 'AdminOrganizerController@reject');
    Route::patch('/organizers/{id}/suspend', 'AdminOrganizerController@suspend');
    
    Route::get('/events', 'AdminEventController@index');
    Route::post('/events', 'AdminEventController@store');
    Route::put('/events/{id}', 'AdminEventController@update');
    Route::delete('/events/{id}', 'AdminEventController@destroy');
    Route::patch('/events/{id}/featured', 'AdminEventController@toggleFeatured');
    Route::patch('/events/{id}/status', 'AdminEventController@updateStatus');
    
    Route::get('/users', 'AdminUserController@index');
    Route::get('/users/{id}', 'AdminUserController@show');
    Route::delete('/users/{id}', 'AdminUserController@destroy');
    Route::patch('/users/{id}/role', 'AdminUserController@updateRole');
    Route::patch('/users/{id}/status', 'AdminUserController@updateStatus');
    
    Route::post('/gate-violations', 'AdminGateViolationController@store');
    Route::get('/gate-violations', 'AdminGateViolationController@index');
    Route::delete('/gate-violations/{userId}', 'AdminGateViolationController@destroy');
    
    Route::get('/orders', 'AdminOrderController@index');
    Route::get('/orders/export-csv', 'AdminOrderController@exportCsv');
    Route::get('/orders/{id}', 'AdminOrderController@show');
    Route::post('/orders/{id}/refund', 'AdminOrderController@refund');
    
    Route::get('/cms', 'AdminCmsController@index');
    Route::put('/cms/hero', 'AdminCmsController@updateHero');
    Route::put('/cms/spotlight', 'AdminCmsController@updateSpotlight');
    
    Route::post('/cms/testimonials', 'AdminTestimonialController@store');
    Route::put('/cms/testimonials/{id}', 'AdminTestimonialController@update');
    Route::delete('/cms/testimonials/{id}', 'AdminTestimonialController@destroy');
    
    Route::post('/cms/blog', 'AdminBlogController@store');
    Route::put('/cms/blog/{id}', 'AdminBlogController@update');
    Route::delete('/cms/blog/{id}', 'AdminBlogController@destroy');
    
    Route::post('/cms/reset', 'AdminCmsController@reset');
});