<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminGateViolationController extends Controller
{
    //

    public function index() {
        return response()->json(["success" => true, "data" => [["id" => 1, "violation" => "Fake ticket"]]]);
    }
}
