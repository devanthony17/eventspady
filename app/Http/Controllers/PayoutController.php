<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PayoutController extends Controller
{
    //

    public function index() {
        return response()->json(["success" => true, "data" => [["id" => "po_123", "amount" => 500, "status" => "pending"]]]);
    }
}
