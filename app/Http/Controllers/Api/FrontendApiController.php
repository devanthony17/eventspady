<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\User;
use App\Models\Category;
use App\Models\Blog;
use App\Models\Setting;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\Banner;
use Carbon\Carbon;

class FrontendApiController extends Controller
{
    public function home()
    {
        $setting = Setting::first(['app_name', 'logo', 'timezone']);
        $timezone = $setting->timezone ?? 'UTC';
        $date = Carbon::now($timezone);

        $events = Event::with(['category:id,name'])
            ->where([
                ['status', 1],
                ['is_deleted', 0],
                ['event_status', 'Pending'],
                ['end_time', '>', $date->format('Y-m-d H:i:s')]
            ])
            ->orderBy('start_time', 'ASC')
            ->get();

        foreach ($events as $value) {
            $value->total_ticket = Ticket::where([['event_id', $value->id], ['is_deleted', 0], ['status', 1]])->sum('quantity');
            $value->sold_ticket = Order::where('event_id', $value->id)->sum('quantity');
            $value->available_ticket = $value->total_ticket - $value->sold_ticket;
        }

        $organizer = User::role('organization')->orderBy('id', 'DESC')->get();
        $category = Category::where('status', 1)->orderBy('id', 'DESC')->get();
        $blog = Blog::with(['category:id,name'])->where('status', 1)->orderBy('id', 'DESC')->get();
        $banners = Banner::where('status', 1)->orderBy('id', 'DESC')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'setting' => $setting,
                'events' => $events,
                'organizers' => $organizer,
                'categories' => $category,
                'blogs' => $blog,
                'banners' => $banners
            ]
        ]);
    }
}
