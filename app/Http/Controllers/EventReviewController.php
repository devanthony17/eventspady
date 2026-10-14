<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EventReviewController extends Controller
{
    //

    public function index($id) {
        return response()->json(["success" => true, "data" => [["id" => 1, "rating" => 5, "comment" => "Great event!"]]]);
    }

    public function store(Request $request, $id) {
        return response()->json(["success" => true, "message" => "Review for event $id submitted."]);
    }
}
