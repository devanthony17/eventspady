<?php

namespace App\Http\Controllers;

use App\Models\NotificationTemplate;
use App\Models\Notification;
use Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class NotificationTemplateController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('notification_template_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $data = NotificationTemplate::OrderBy('id','DESC')->get();
        return view('admin.template.index', compact('data')); 
    }

    public function create()
    {
        abort_if(Gate::denies('notification_template_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        return view('admin.template.create'); 
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'bail|required',
            'subject' => 'bail|required',            
        ]);       
        $data = $request->all();             
        NotificationTemplate::create($data);
        return redirect()->route('notification-template.index')->withStatus(__('Template is added successfully.'));
    }

    public function show(Category $category)
    {
      
    }

    public function edit(NotificationTemplate $notificationTemplate)
    {
        abort_if(Gate::denies('notification_template_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        return response()->json(['success'=>true ,'data' =>$notificationTemplate ], 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'subject' => 'bail|required',            
        ]);       
        $data = $request->all();                   
        NotificationTemplate::find($id)->update($data);
        return redirect()->route('notification-template.index')->withStatus(__('Template is update successfully.'));
    }

    public function destroy(NotificationTemplate $notificationTemplate)
    {
        
    }

    public function notification(){
        $notification = Notification::where('organizer_id',Auth::user()->id)->orderBy('id','DESC')->get();
        return view('admin.notification',compact('notification'));
    }

    public function deleteNotification($id){
        $data = Notification::find($id);        
        $data->delete();
        return redirect()->back();
    }
}
