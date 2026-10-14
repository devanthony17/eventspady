<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminEventController extends Controller
{
    /**
     * List all platform events with detailed statistics
     */
    public function index(Request $request)
    {
        $events = Event::with(['category', 'organization'])
            ->where('is_deleted', 0)
            ->orderBy('id', 'DESC')
            ->get();

        $eventsArray = $events->map(function ($item) {
            $arr = $item->toArray();
            $arr['id'] = (string)$arr['id'];
            $arr['title'] = $arr['name'] ?? 'Untitled';
            $arr['tagline'] = $arr['description'] ?? '';
            $arr['start'] = $arr['start_time'] ? Carbon::parse($arr['start_time'])->toIsoString() : now()->toIsoString();
            $arr['end'] = $arr['end_time'] ? Carbon::parse($arr['end_time'])->toIsoString() : now()->addHours(3)->toIsoString();

            if (!empty($arr['image'])) {
                $arr['cover'] = filter_var($arr['image'], FILTER_VALIDATE_URL)
                    ? $arr['image']
                    : url('/images/events/' . $arr['image']);
            } else {
                $arr['cover'] = '/images/events/event-1.svg';
            }

            $arr['venue'] = [
                'name' => $arr['address'] ?? 'Wa Regional Center',
                'address' => $arr['address'] ?? 'Wa Central',
                'city' => 'Wa',
                'country' => 'Ghana',
                'lat' => $arr['lat'] ?? 10.0606,
                'lng' => $arr['lang'] ?? -2.5057,
            ];

            $arr['capacity'] = (int)($arr['people'] ?? 100);
            $arr['sold'] = (int)Order::where('event_id', $item->id)->sum('quantity');
            $arr['remaining'] = max(0, $arr['capacity'] - $arr['sold']);
            $arr['featured'] = str_contains((string)($arr['tags'] ?? ''), 'featured') || ($arr['status'] == 1);
            $arr['status'] = $arr['status'] == 1 ? 'published' : ($arr['event_status'] ?? 'pending');

            $slugBase = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $arr['name'] ?? 'event'));
            $slugBase = trim($slugBase, '-');
            $arr['slug'] = $slugBase . '-' . $arr['id'];

            // Tickets
            $tickets = Ticket::where([['event_id', $item->id], ['is_deleted', 0]])->orderBy('id', 'ASC')->get();
            if ($tickets->count() > 0) {
                $arr['tickets'] = $tickets->map(function ($t) {
                    return [
                        'id' => (string)$t->id,
                        'name' => $t->name,
                        'price' => (float)$t->price,
                        'quantity' => (int)$t->quantity,
                        'sold' => (int)Order::where('ticket_id', $t->id)->sum('quantity'),
                        'type' => $t->type ?? ($t->price > 0 ? 'paid' : 'free'),
                        'perOrderLimit' => (int)($t->ticket_per_order ?? 10),
                        'description' => $t->description ?? '',
                    ];
                });
                $arr['priceFrom'] = (float)$tickets->min('price');
                $arr['isFree'] = $arr['priceFrom'] == 0;
            } else {
                $arr['tickets'] = [
                    [
                        'id' => 'tkt-default-' . $item->id,
                        'name' => 'General Admission',
                        'price' => 0,
                        'quantity' => $arr['capacity'],
                        'sold' => 0,
                        'type' => 'free',
                        'perOrderLimit' => 10,
                        'description' => 'Standard Entry Pass',
                    ]
                ];
                $arr['priceFrom'] = 0;
                $arr['isFree'] = true;
            }

            if (isset($arr['category'])) $arr['category']['id'] = (string)$arr['category']['id'];
            if (isset($arr['organization'])) $arr['organization']['id'] = (string)$arr['organization']['id'];

            return $arr;
        });

        return response()->json([
            'success' => true,
            'events' => $eventsArray,
            'data' => $eventsArray,
        ]);
    }

    /**
     * Create an event directly from Admin console
     */
    public function store(Request $request)
    {
        $userId = auth('api')->id() ?? User::where('status', 1)->value('id') ?? 1;

        $categoryId = $request->input('category_id');
        if (!$categoryId && $request->has('category')) {
            $catInput = $request->input('category');
            if (is_numeric($catInput)) {
                $categoryId = (int)$catInput;
            } elseif (is_string($catInput)) {
                $cat = Category::where('name', 'LIKE', '%' . $catInput . '%')->first();
                if ($cat) {
                    $categoryId = $cat->id;
                }
            }
        }
        $categoryId = $categoryId ?? Category::value('id') ?? 1;

        try {
            $startTime = Carbon::parse($request->input('start') ?? $request->input('start_time') ?? now())->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            $startTime = now()->format('Y-m-d H:i:s');
        }

        try {
            $endTime = Carbon::parse($request->input('end') ?? $request->input('end_time') ?? Carbon::parse($startTime)->addHours(4))->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            $endTime = Carbon::parse($startTime)->addHours(4)->format('Y-m-d H:i:s');
        }

        $venueName = $request->input('venue.name') ?? $request->input('venueName') ?? $request->input('address') ?? 'Wa Central';
        $cover = $request->input('cover') ?? $request->input('image') ?? 'event-1.svg';

        $highlights = $request->input('highlights');
        $tags = ($request->boolean('featured') ? 'featured,' : '');
        if ($highlights) {
            $tags .= is_array($highlights) ? implode(',', $highlights) : $highlights;
        }

        $event = Event::create([
            'name' => $request->input('title') ?? $request->input('name') ?? 'Untitled Event',
            'user_id' => $userId,
            'scanner_id' => $userId,
            'type' => $request->input('type') === 'online' ? 'online' : 'offline',
            'address' => $venueName,
            'category_id' => $categoryId,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'image' => $cover,
            'people' => (int)($request->input('capacity') ?? 100),
            'lat' => (float)($request->input('venue.lat') ?? $request->input('lat') ?? 10.0606),
            'lang' => (float)($request->input('venue.lng') ?? $request->input('lang') ?? -2.5057),
            'description' => $request->input('description') ?? $request->input('tagline') ?? '',
            'security' => 1,
            'tags' => $tags,
            'status' => 1,
            'event_status' => 'Published',
            'is_deleted' => 0,
        ]);

        // Process tickets if provided
        $tickets = $request->input('tickets', []);
        if (is_array($tickets) && count($tickets) > 0) {
            foreach ($tickets as $idx => $t) {
                Ticket::create([
                    'event_id' => $event->id,
                    'user_id' => $userId,
                    'ticket_number' => 'TKT-' . $event->id . '-' . ($idx + 1) . '-' . strtoupper(Str::random(4)),
                    'name' => $t['name'] ?? 'General Admission',
                    'type' => $t['type'] ?? ($request->boolean('isFree') ? 'free' : 'paid'),
                    'quantity' => (int)($t['quantity'] ?? 100),
                    'ticket_per_order' => (int)($t['perOrderLimit'] ?? 10),
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'price' => $request->boolean('isFree') ? 0 : (int)round((float)($t['price'] ?? 0)),
                    'description' => $t['description'] ?? '',
                    'status' => 1,
                    'is_deleted' => 0,
                ]);
            }
        } else {
            Ticket::create([
                'event_id' => $event->id,
                'user_id' => $userId,
                'ticket_number' => 'TKT-' . $event->id . '-1-' . strtoupper(Str::random(4)),
                'name' => 'General Admission',
                'type' => $request->boolean('isFree') ? 'free' : 'paid',
                'quantity' => (int)($request->input('capacity') ?? 100),
                'ticket_per_order' => 10,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'price' => 0,
                'description' => 'Standard Entry Pass',
                'status' => 1,
                'is_deleted' => 0,
            ]);
        }

        $slugBase = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $event->name ?? 'event'));
        $slugBase = trim($slugBase, '-');
        $slug = $slugBase . '-' . $event->id;

        $formatted = [
            'id' => (string)$event->id,
            'title' => $event->name,
            'tagline' => $event->description,
            'start' => Carbon::parse($event->start_time)->toIsoString(),
            'end' => Carbon::parse($event->end_time)->toIsoString(),
            'cover' => $cover,
            'venue' => [
                'name' => $venueName,
                'address' => $venueName,
                'city' => 'Wa',
                'country' => 'Ghana',
            ],
            'slug' => $slug,
            'status' => 'published',
            'capacity' => (int)$event->people,
            'sold' => 0,
            'remaining' => (int)$event->people,
            'featured' => $request->boolean('featured'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully!',
            'event' => $formatted,
            'data' => $formatted,
        ], 201);
    }

    /**
     * Update an existing event from Admin console
     */
    public function update(Request $request, $id)
    {
        $event = Event::where('id', $id)->orWhere('name', $id)->first();
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => "Event not found with ID: $id",
            ], 404);
        }

        $fields = [];
        if ($request->has('title') || $request->has('name')) {
            $fields['name'] = $request->input('title') ?? $request->input('name');
        }
        if ($request->has('description') || $request->has('tagline')) {
            $fields['description'] = $request->input('description') ?? $request->input('tagline');
        }
        if ($request->has('start') || $request->has('start_time')) {
            $start = $request->input('start') ?? $request->input('start_time');
            $fields['start_time'] = Carbon::parse($start)->format('Y-m-d H:i:s');
        }
        if ($request->has('end') || $request->has('end_time')) {
            $end = $request->input('end') ?? $request->input('end_time');
            $fields['end_time'] = Carbon::parse($end)->format('Y-m-d H:i:s');
        }
        if ($request->has('venueName') || $request->has('address') || $request->has('venue.name')) {
            $fields['address'] = $request->input('venue.name') ?? $request->input('venueName') ?? $request->input('address');
        }
        if ($request->has('type')) {
            $fields['type'] = $request->input('type') === 'online' ? 'online' : 'offline';
        }
        if ($request->has('capacity') || $request->has('people')) {
            $fields['people'] = (int)($request->input('capacity') ?? $request->input('people'));
        }
        if ($request->has('cover') || $request->has('image')) {
            $fields['image'] = $request->input('cover') ?? $request->input('image');
        }
        if ($request->has('featured')) {
            $tags = $event->tags ?? '';
            if ($request->boolean('featured') && !str_contains($tags, 'featured')) {
                $tags = 'featured,' . $tags;
            } elseif (!$request->boolean('featured')) {
                $tags = str_replace('featured,', '', str_replace('featured', '', $tags));
            }
            $fields['tags'] = $tags;
        }

        if (!empty($fields)) {
            $event->update($fields);
        }

        // Sync tickets if provided
        $tickets = $request->input('tickets');
        if (is_array($tickets)) {
            // Delete old tickets or soft delete
            Ticket::where('event_id', $event->id)->update(['is_deleted' => 1]);

            $userId = $event->user_id ?? 1;
            $startTime = $fields['start_time'] ?? $event->start_time ?? now()->format('Y-m-d H:i:s');
            $endTime = $fields['end_time'] ?? $event->end_time ?? Carbon::parse($startTime)->addHours(4)->format('Y-m-d H:i:s');

            foreach ($tickets as $idx => $t) {
                Ticket::create([
                    'event_id' => $event->id,
                    'user_id' => $userId,
                    'ticket_number' => 'TKT-' . $event->id . '-' . ($idx + 1) . '-' . strtoupper(Str::random(4)),
                    'name' => $t['name'] ?? 'Admission Pass',
                    'type' => $t['type'] ?? 'paid',
                    'quantity' => (int)($t['quantity'] ?? 100),
                    'ticket_per_order' => (int)($t['perOrderLimit'] ?? 10),
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'price' => (float)($t['price'] ?? 0),
                    'description' => $t['description'] ?? '',
                    'status' => 1,
                    'is_deleted' => 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Event '{$event->name}' updated successfully!",
            'event' => $event,
            'data' => $event,
        ]);
    }

    /**
     * Toggle featured status on homepage
     */
    public function toggleFeatured(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        }

        $featured = $request->has('featured')
            ? $request->boolean('featured')
            : !str_contains((string)$event->tags, 'featured');

        $tags = (string)$event->tags;
        if ($featured && !str_contains($tags, 'featured')) {
            $tags = 'featured,' . $tags;
        } elseif (!$featured) {
            $tags = str_replace('featured,', '', str_replace('featured', '', $tags));
        }

        $event->update(['tags' => $tags]);

        return response()->json([
            'success' => true,
            'featured' => $featured,
            'message' => $featured ? 'Event featured on homepage.' : 'Event removed from homepage featured.',
        ]);
    }

    /**
     * Update moderation status
     */
    public function updateStatus(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        }

        $status = $request->input('status', 'published');
        $event->update([
            'status' => $status === 'published' ? 1 : 0,
            'event_status' => ucfirst($status),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Event status updated to {$status}.",
        ]);
    }

    /**
     * Remove an event from the platform
     */
    public function destroy($id)
    {
        $event = Event::find($id);
        if ($event) {
            $event->update([
                'is_deleted' => 1,
                'event_status' => 'Deleted',
            ]);
            Ticket::where('event_id', $id)->update(['is_deleted' => 1]);
        }

        return response()->json([
            'success' => true,
            'message' => "Event $id deleted.",
        ]);
    }
}
