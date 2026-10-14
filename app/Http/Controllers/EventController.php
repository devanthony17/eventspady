<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\Order;
use App\Http\Controllers\AppHelper;
use App\Models\User;
use App\Models\AppUser;
use Carbon\Carbon;
use Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Gate;

class EventController extends Controller
{
    public function index()
    {
        if (request()->expectsJson() || request()->is('api/*')) {
            $events = Event::with(['category','organization'])->where('is_deleted',0)->where('status',1)->orderBy('id','DESC')->get();
            $eventsArray = $events->map(function($item) {
                $arr = $item->toArray();
                $arr['id'] = (string)$arr['id'];
                // React frontend strictly expects these properties
                $arr['title'] = $arr['name'] ?? 'Untitled'; 
                $arr['tagline'] = $arr['description'] ?? '';
                $arr['start'] = $arr['start_time'] ?? now()->toIsoString();
                $arr['end'] = $arr['end_time'] ?? now()->addHours(2)->toIsoString();
                $arr['cover'] = $arr['image'] ? url('/images/events/' . $arr['image']) : '';
                $arr['venue'] = [
                    'name' => $arr['address'] ?? 'TBA',
                    'city' => $arr['address'] ?? 'Wa',
                    'lat' => $arr['lat'] ?? 10.0606,
                    'lng' => $arr['lang'] ?? -2.5057
                ];
                $arr['capacity'] = $arr['people'] ?? 100;
                $arr['sold'] = 0; // Assuming 0 for now
                $arr['remaining'] = $arr['capacity'];
                $arr['priceFrom'] = 0;
                $arr['isFree'] = true;
                $arr['featured'] = true;
                // Generate a URL-safe slug from the event name + id so EventCard links resolve correctly
                $slugBase = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $arr['name'] ?? 'event'));
                $slugBase = trim($slugBase, '-');
                $arr['slug'] = $slugBase . '-' . $arr['id'];
                if (isset($arr['category'])) $arr['category']['id'] = (string)$arr['category']['id'];
                if (isset($arr['organization'])) $arr['organization']['id'] = (string)$arr['organization']['id'];
                return $arr;
            });
            return response()->json(['success' => true, 'data' => $eventsArray]);
        }
        abort_if(Gate::denies('event_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        if(Auth::check() && Auth::user()->hasRole('admin')){
            $events = Event::with(['category','organization'])->where('is_deleted',0)->orderBy('id','DESC')->get();
        }
        elseif(Auth::user()->hasRole('organization')){
            $events = Event::with(['category','organization'])->where([['user_id',Auth::user()->id],['is_deleted',0]])->orderBy('id','DESC')->get();
            foreach ($events as $value) {
                $value->scanner = User::find($value->scanner_id);
            }
        }

        return view('admin.event.index', compact('events'));
    }

    public function create()
    {
        abort_if(Gate::denies('event_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $category = Category::where('status',1)->orderBy('id','DESC')->get();
        $users = User::role('organization')->orderBy('id','DESC')->get();
        if(Auth::user()->hasRole('admin')){
            $scanner = User::role('scanner')->orderBy('id','DESC')->get();
        }
        else if(Auth::user()->hasRole('organization')){
            $scanner = User::role('scanner')->where('org_id',Auth::user()->id)->orderBy('id','DESC')->get();
        }
        return view('admin.event.create', compact('category','users','scanner'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'bail|required',
            'image' => 'bail|required',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'category_id' => 'bail|required',
            'type' => 'bail|required',
            'address' => 'bail|required_if:type,offline',
            'lat' => 'bail|required_if:type,offline',
            'lang' => 'bail|required_if:type,offline',
            'status' => 'bail|required',
            'description' => 'bail|required',
            'scanner_id' => 'bail|required',
            'people' => 'bail|required',
        ]);
        $data = $request->all();
        if ($request->hasFile('image'))
        {

            $data['image'] = (new AppHelper)->saveImage($request);
        }
        if(!Auth::user()->hasRole('admin')){
            $data['user_id'] = Auth::user()->id;
        }
        $event = Event::create($data);
        return redirect()->route('events.index')->withStatus(__('Event is added successfully.'));
    }

    public function show($slugOrId)
    {
        // Extract numeric ID: if slugOrId ends with "-{number}" (slug format), use that number as ID.
        // Otherwise fall back to using slugOrId directly as a numeric ID.
        if (preg_match('/-(\d+)$/', $slugOrId, $matches)) {
            $id = (int) $matches[1];
        } else {
            $id = (int) $slugOrId;
        }

        if (request()->expectsJson() || request()->is('api/*')) {
            $event = Event::with(['category', 'organization'])->find($id);
            if (!$event) {
                return response()->json(['success' => false, 'message' => 'Event not found.'], 404);
            }
            $arr = $event->toArray();
            $arr['id'] = (string)$arr['id'];
            $arr['title'] = $arr['name'] ?? 'Untitled';
            $arr['tagline'] = $arr['description'] ?? '';
            $arr['start'] = $arr['start_time'] ?? now()->toIsoString();
            $arr['end'] = $arr['end_time'] ?? now()->addHours(2)->toIsoString();
            $arr['cover'] = $arr['image'] ? url('/images/events/' . $arr['image']) : '';
            $arr['venue'] = [
                'name' => $arr['address'] ?? 'TBA',
                'city' => $arr['address'] ?? 'Wa',
                'lat'  => $arr['lat'] ?? 10.0606,
                'lng'  => $arr['lang'] ?? -2.5057,
            ];
            $arr['capacity'] = $arr['people'] ?? 100;
            $arr['sold'] = 0;
            $arr['remaining'] = $arr['capacity'];
            $arr['priceFrom'] = 0;
            $arr['isFree'] = true;
            $arr['featured'] = true;
            $slugBase = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $arr['name'] ?? 'event'));
            $arr['slug'] = trim($slugBase, '-') . '-' . $arr['id'];
            $tickets = Ticket::where([['event_id', $event->id], ['is_deleted', 0]])->orderBy('id', 'DESC')->get();
            $arr['tickets'] = $tickets->map(function ($t) {
                return [
                    'id'       => (string)$t->id,
                    'name'     => $t->name,
                    'price'    => (float)$t->price,
                    'quantity' => (int)$t->quantity,
                    'sold'     => (int)Order::where('ticket_id', $t->id)->sum('quantity'),
                    'currency' => 'GHS',
                ];
            });
            if (isset($arr['category'])) $arr['category']['id'] = (string)$arr['category']['id'];
            if (isset($arr['organization'])) $arr['organization']['id'] = (string)$arr['organization']['id'];
            return response()->json(['success' => true, 'event' => $arr]);
        }

        // Admin blade view
        $event = Event::with(['category', 'organization'])->find($id);
        if (!$event) abort(404);
        $event->ticket = Ticket::where([['event_id', $event->id], ['is_deleted', 0]])->orderBy('id', 'DESC')->get();
        $event->sales = Order::with(['customer:id,name', 'ticket:id,name'])->where('event_id', $event->id)->orderBy('id', 'DESC')->get();
        foreach ($event->ticket as $value) {
            $value->used_ticket = Order::where('ticket_id', $value->id)->sum('quantity');
        }
        return view('admin.event.view', compact('event'));
    }

    public function edit(Event $event)
    {
        abort_if(Gate::denies('event_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $category =  Category::where('status',1)->orderBy('id','DESC')->get();
        $users = User::role('organization')->orderBy('id','DESC')->get();
        if(Auth::user()->hasRole('admin')){
            $scanner = User::role('scanner')->orderBy('id','DESC')->get();
        }
        else if(Auth::user()->hasRole('organization')){
            $scanner = User::role('scanner')->where('org_id',Auth::user()->id)->orderBy('id','DESC')->get();
        }
        return view('admin.event.edit', compact( 'event','category','users','scanner'));
    }

    public function update(Request $request, Event $event)
    {
        $request->validate([
            'name' => 'bail|required',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'category_id' => 'bail|required',
            'type' => 'bail|required',
            'address' => 'bail|required_if:type,offline',
            'lat' => 'bail|required_if:type,offline',
            'lang' => 'bail|required_if:type,offline',
            'status' => 'bail|required',
            'description' => 'bail|required',
            'scanner_id' => 'bail|required',
            'people' => 'bail|required',
        ]);
        $data = $request->all();
        if ($request->hasFile('image'))
        {
            (new AppHelper)->deleteFile($event->image);
            $data['image'] = (new AppHelper)->saveImage($request);
        }
        $event = Event::find($event->id)->update($data);
        return redirect()->route('events.index')->withStatus(__('Event is updated successfully.'));
    }

    public function destroy(Event $event)
    {
        try{
            Event::find($event->id)->update(['is_deleted'=>1,'event_status'=>'Deleted']);
            $ticket = Ticket::where('event_id',$event->id)->update(['is_deleted'=>1]);
            return true;
        }catch(Throwable $th){
            return response('Data is Connected with other Data', 400);
        }
    }

    public function getMonthEvent(Request $request){
        $day = Carbon::parse($request->year.'-'.$request->month.'-01')->daysInMonth;
        if(Auth::user()->hasRole('organization')){
            $data = Event::whereBetween('start_time', [ $request->year."-".$request->month."-01 12:00",  $request->year."-".$request->month."-".$day."  23:59"])
            ->where([['status',1],['is_deleted',0],['user_id',Auth::user()->id]])
            ->orderBy('id','DESC')
            ->get();
        }
        if(Auth::user()->hasRole('admin'))
        {
            $data = Event::whereBetween('start_time', [ $request->year."-".$request->month."-01 12:00",  $request->year."-".$request->month."-".$day." 23:59"])
            ->where([['status',1],['is_deleted',0]])->orderBy('id','DESC')->get();
        }
        foreach ($data as $value) {
            $value->tickets = Ticket::where([['event_id',$value->id],['is_deleted',0]])->sum('quantity');
            $value->sold_ticket = Order::where('event_id',$value->id)->sum('quantity');
            $value->day = $value->start_time->format('D');
            $value->date = $value->start_time->format('d');
            $value->average = $value->tickets==0? 0: $value->sold_ticket*100/$value->tickets;
        }
        return response()->json([ 'data' => $data,'success'=>true], 200);
    }

    public function eventGallery($id){
        $data  = Event::find($id);
        return view('admin.event.gallery',compact( 'data'));
    }

    public function addEventGallery(Request $request){
        $event = array_filter(explode(',',Event::find($request->id)->gallery));
        if ($request->hasFile('file')) {
            $image = $request->file('file');
            $name = uniqid() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/images/upload');
            $image->move($destinationPath, $name);
            array_push($event,$name);
            Event::find($request->id)->update(['gallery'=>implode(',',$event)]);
        }
        return true;
    }

    public function removeEventImage($image,$id){

        $gallery = array_filter(explode(',',Event::find($id)->gallery));
        if(count(array_keys($gallery,$image))>0){
            if (($key = array_search($image, $gallery)) !== false) {
                unset($gallery[$key]);
            }
        }
        $aa =implode(',',$gallery);
        $data= Event::find($id);
        $data->gallery =$aa;
        $data->update();
        return redirect()->back();
    }

    public function report(Request $request, $id) {
        return response()->json(["success" => true, "message" => "Event $id reported successfully."]);
    }

    public function inquire(Request $request, $id) {
        return response()->json(["success" => true, "message" => "Inquiry for event $id sent."]);
    }
}
