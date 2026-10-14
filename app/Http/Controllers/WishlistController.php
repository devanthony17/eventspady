<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WishlistController extends Controller
{
    //

    public function clear() {
        return response()->json(["success" => true, "message" => "Wishlist cleared."]);
    }
}
