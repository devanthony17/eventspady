<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocationController extends Controller
{
    //

    public function index() {
        return response()->json([
            "success" => true, 
            "data" => [
                ["id" => "Wa", "name" => "Wa (Central)", "region" => "Upper West", "lat" => 10.0606, "lng" => -2.5057], 
                ["id" => "Accra", "name" => "Accra", "region" => "Greater Accra", "lat" => 5.6037, "lng" => -0.187]
            ]
        ]);
    }
}
