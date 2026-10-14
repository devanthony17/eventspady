<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview(Request $request)
    {
        $totalEvents = Event::where('is_deleted', 0)->count();
        $totalOrders = Order::count();
        $totalTicketsSold = (int)Order::sum('quantity');
        $totalGmv = (float)Order::sum('payment');
        $platformCommission = round($totalGmv * 0.05, 2);
        $totalUsers = User::count();

        return response()->json([
            'success' => true,
            'data' => [
                'totalEvents' => $totalEvents,
                'totalOrders' => $totalOrders,
                'totalTicketsSold' => $totalTicketsSold,
                'totalGmv' => $totalGmv,
                'platformCommission' => $platformCommission,
                'totalUsers' => $totalUsers,
            ]
        ]);
    }
}
