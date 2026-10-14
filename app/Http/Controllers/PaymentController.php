<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaymentController extends Controller
{
    //

    public function paystackInitialize(Request $request) {
        return response()->json(["success" => true, "data" => ["authorization_url" => "https://checkout.paystack.com/m0ck"]]);
    }

    public function paystackVerify($reference) {
        return response()->json(["success" => true, "message" => "Payment $reference verified."]);
    }

    public function flutterwaveInitialize(Request $request) {
        return response()->json(["success" => true, "data" => ["link" => "https://checkout.flutterwave.com/m0ck"]]);
    }

    public function flutterwaveVerify($tx_ref) {
        return response()->json(["success" => true, "message" => "Payment $tx_ref verified."]);
    }
}
