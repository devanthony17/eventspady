<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Event;
use Illuminate\Http\Request;

class AdminOrganizerController extends Controller
{
    /**
     * List all platform organizers
     */
    public function index(Request $request)
    {
        $organizers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['organization', 'organizer', 'admin']);
        })->orWhere('status', 1)->get();

        $data = $organizers->map(function ($u) {
            $eventsCount = Event::where('user_id', $u->id)->where('is_deleted', 0)->count();
            return [
                'id' => (string)$u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? '+233 24 000 0000',
                'logo' => $u->image ? url('images/upload/' . $u->image) : '/images/mark.svg',
                'verified' => $u->status == 1,
                'status' => $u->status == 1 ? 'verified' : ($u->status == 2 ? 'pending' : 'rejected'),
                'eventsCount' => $eventsCount,
                'rating' => 5.0,
                'reviews' => 0,
                'commissionRate' => 5,
            ];
        });

        return response()->json([
            'success' => true,
            'organizers' => $data,
            'data' => $data,
        ]);
    }

    public function verify($id)
    {
        $user = User::find($id);
        if ($user) {
            $user->update(['status' => 1]);
        }
        return response()->json(['success' => true, 'message' => "Organizer verified."]);
    }

    public function reject(Request $request, $id)
    {
        $user = User::find($id);
        if ($user) {
            $user->update(['status' => 0]);
        }
        return response()->json(['success' => true, 'message' => "Organizer rejected."]);
    }

    public function suspend(Request $request, $id)
    {
        $user = User::find($id);
        if ($user) {
            $user->update(['status' => 0]);
        }
        return response()->json(['success' => true, 'message' => "Organizer suspended."]);
    }

    public function updateCommission(Request $request, $id)
    {
        return response()->json(["success" => true, "message" => "Organizer $id commission updated."]);
    }
}
