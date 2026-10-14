<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class OrganizerController extends Controller
{
    public function index()
    {
        $users = User::role('organization')->where('status', 1)->orderBy('id', 'DESC')->get();
        $usersArray = $users->map(function($item) {
            $arr = $item->toArray();
            $arr['id'] = (string)$arr['id'];
            return $arr;
        });
        return response()->json([
            'success' => true,
            'data' => $usersArray
        ]);
    }
}
