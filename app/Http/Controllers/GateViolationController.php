<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GateViolationController extends Controller
{
    //

    public function store(Request $request) {
        return response()->json(["success" => true, "message" => "Gate violation recorded."]);
    }
}
