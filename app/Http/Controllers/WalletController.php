<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WalletController extends Controller
{
    //

    public function transactions() {
        return response()->json(["success" => true, "data" => [["id" => "tx_1", "amount" => 100, "type" => "credit"]]]);
    }
}
