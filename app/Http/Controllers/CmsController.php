<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CmsController extends Controller
{
    //
    public function landing() {
        return response()->json([
            "success" => true,
            "data" => [
                "hero" => ["title" => "Welcome to Eventspady", "subtitle" => "Discover amazing events"],
                "spotlight" => []
            ]
        ]);
    }

    public function faq() {
        return response()->json(["success" => true, "data" => [["question" => "What is Eventspady?", "answer" => "A ticketing platform."]]]);
    }

    public function plans() {
        return response()->json(["success" => true, "data" => [["name" => "Basic", "price" => 0], ["name" => "Pro", "price" => 50]]]);
    }
}
