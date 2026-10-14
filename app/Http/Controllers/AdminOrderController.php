<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    //

    public function show($id) {
        return response()->json(["success" => true, "data" => ["id" => $id, "total" => 150.00]]);
    }

    public function exportCsv() {
        return response()->json(["success" => true, "message" => "CSV export started.", "download_url" => "https://example.com/export.csv"]);
    }
}
