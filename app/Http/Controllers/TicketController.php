<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Event;
use Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    public function index($id,$name)
    {  
        abort_if(Gate::denies('ticket_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $event = Event::find($id);
        $ticket = Ticket::where([['event_id',$id],['is_deleted',0]])->orderBy('id','DESC')->get();
        return view('admin.ticket.index', compact('ticket','event'));
        
    }

    public function create($id)
    {
        abort_if(Gate::denies('ticket_create'), Response::HTTP_FORBIDDEN, '403 Forbidden'); 
        $event = Event::find($id);
        return view('admin.ticket.create',compact('event'));
    }

   
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'bail|required',
            'quantity' => 'bail|required',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'type' => 'bail|required',
            'ticket_per_order'=> 'bail|required',
            'price' =>  'bail|required_if:type,paid',            
        ]);   
        $data = $request->all();       
        if($request->type=="free"){
            $data['price'] = 0;
        }
        $data['ticket_number'] = chr(rand(65,90)).chr(rand(65,90)).'-'.rand(999,10000);
        $event = Event::find($request->event_id);
        $data['user_id'] = $event->user_id;
        Ticket::create($data);  
        return redirect($request->event_id.'/'.preg_replace('/\s+/', '-', $event->name).'/tickets')->withStatus(__('Ticket is added successfully.'));
    }

    public function show(Ticket $ticket)
    {

    }

    public function edit($id)
    {
        abort_if(Gate::denies('ticket_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $ticket = Ticket::find($id);
        $event = Event::find($ticket->event_id);
        
        return view('admin.ticket.edit',compact('ticket','event'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'bail|required',
            'quantity' => 'bail|required',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'type' => 'bail|required',
            'ticket_per_order'=> 'bail|required',
            'price' =>  'bail|required_if:type,paid',            
        ]);   
        $data = $request->all();        
        if($request->type=="free"){
            $data['price'] = 0;
        }        
        $event = Event::find($request->event_id);
        Ticket::find($id)->update($data);  
        return redirect($request->event_id.'/'.preg_replace('/\s+/', '-', $event->name).'/tickets')->withStatus(__('Ticket is updated successfully.'));
    }

    public function destroy(Ticket $ticket)
    {
      
    }

    public function deleteTickets($id){
        try{
            $ticket = Ticket::find($id)->update(['is_deleted'=>1]);
            return true;
        }catch(Throwable $th){
            return response('Data is Connected with other Data', 400);
        }
    }

    public function userTickets(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [],
            'tickets' => [],
            'orders' => []
        ]);
    }
}
