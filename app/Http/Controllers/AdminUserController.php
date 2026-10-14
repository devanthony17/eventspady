<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    //

    public function show($id) {
        return response()->json(["success" => true, "data" => ["id" => $id, "name" => "Admin Target User"]]);
    }

    public function destroy($id) {
        return response()->json(["success" => true, "message" => "User $id deleted."]);
    }

    public function updateRole(Request $request, $id) {
        return response()->json(["success" => true, "message" => "User $id role updated."]);
    }
}
