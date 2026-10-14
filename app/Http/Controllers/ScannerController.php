<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class ScannerController extends Controller
{
    /**
     * POST /organizer/scanner/check-in
     * Door scanner API called when camera detects ticket QR code at the entrance.
     */
    public function checkIn(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'eventId' => 'required|string',
        ]);

        $code = $request->input('code');
        $eventId = $request->input('eventId');

        // TODO: Replace this mock data with actual database queries once the models (e.g. TicketStub) are set up.
        // $ticket = \App\Models\TicketStub::where('code', $code)->where('event_id', $eventId)->first();
        
        // Mocking the ticket for demonstration
        $ticket = [
            'id' => 'tkt_9921',
            'code' => $code,
            'event_id' => $eventId,
            'is_scanned' => false, 
            'scanned_at' => null,
            'attendee_name' => 'Kofi Owusu',
            'tier_name' => 'VIP Royal Enclosure'
        ];

        // 1. Check if ticket exists (404 Not Found)
        if (!$ticket || $ticket['event_id'] !== $eventId) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'TICKET_NOT_FOUND',
                    'message' => 'Invalid or forged ticket code.',
                    'details' => []
                ],
                'meta' => [
                    'timestamp' => Carbon::now()->toIso8601String(),
                    'requestId' => 'req_' . uniqid()
                ]
            ], 404);
        }

        // 2. Check for duplicate scan (409 Conflict)
        if ($ticket['is_scanned']) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DUPLICATE_CHECKIN',
                    'message' => 'This ticket has already been scanned at the entrance.',
                    'details' => [
                        'scanned_at' => $ticket['scanned_at']
                    ]
                ],
                'meta' => [
                    'timestamp' => Carbon::now()->toIso8601String(),
                    'requestId' => 'req_' . uniqid()
                ]
            ], 409);
        }

        // 3. Mark ticket as scanned (200 OK)
        // $ticket->is_scanned = true;
        // $ticket->scanned_at = Carbon::now();
        // $ticket->save();

        $scannedAt = Carbon::now()->toIso8601String();

        return response()->json([
            'success' => true,
            'data' => [
                'attendeeName' => $ticket['attendee_name'],
                'ticketTier' => $ticket['tier_name'],
                'checkedInAt' => $scannedAt
            ],
            'message' => 'Ticket successfully validated and checked in.',
            'meta' => [
                'timestamp' => Carbon::now()->toIso8601String(),
                'requestId' => 'req_' . uniqid()
            ]
        ], 200);
    }

    public function undoCheckIn($ticketCode) {
        return response()->json(["success" => true, "message" => "Check-in undone for $ticketCode."]);
    }
}
