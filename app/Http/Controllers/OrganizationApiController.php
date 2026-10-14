<?php

namespace App\Http\Controllers;

use Auth;
use App\Models\AppUser;
use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\PaymentSetting;
use App\Models\Tax;
use App\Models\Feedback;
use App\Models\Currency;
use App\Models\Faq;
use App\Models\Ticket;
use App\Models\Setting;
use App\Mail\ResetPassword;
use App\Http\Controllers\AppHelper;
use App\Models\NotificationTemplate;
use App\Models\Notification;
use App\Models\EventReport;
use Carbon\Carbon;
use DB;    
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class OrganizationApiController extends Controller
{
    public function organizationLogin(Request $request){
        $request->validate([
            'email' => 'bail|required|email',            
            'password' => 'bail|required',                            
            'device_token' => 'bail|required',                            
        ]);

        $userdata = array( 'email' => $request->email, 'password' => $request->password );
        if(Auth::attempt($userdata)){
            $user = Auth::user();
            User::find($user->id)->update(['device_token'=>$request->device_token]);
            $user['token'] = $user->createToken('eventRight')->accessToken; 
            return response()->json(['msg' => 'Login successfully', 'data' => $user,'success'=>true], 200); 
        }
        else{
            return response()->json(['msg' => 'Invalid Username or password', 'data' => null,'success'=>false], 400);
        }
                      
    }

    public function organizationRegister(Request $request){
        $request->validate([
            'email' => 'bail|required|email|unique:users',            
            'confirm_email' => 'bail|required|email|same:email',            
            'first_name' => 'bail|required',            
            'last_name' => 'bail|required',      
            'phone' => 'bail|required',            
            'password' => 'bail|required|min:6',                            
        ]);
        $data = $request->all();
        $data['image'] = "defaultuser.png";
        $data['password'] =  Hash::make($request->password);
        $data['language'] = Setting::first()->language;
        $user = User::create($data);
        $user->assignRole('organization');
        $user['token'] = $user->createToken('eventRight')->accessToken;
        return response()->json(['msg' => null, 'data' => $user,'success'=>true], 200);
    }

    public function setProfile(Request $request){
        $data= $request->all();
        if(isset($request->image)){                  
            $data['image'] = (new AppHelper)->saveApiImage($request);                                      
        }
        
        User::find(Auth::user()->id)->update($data);
        return response()->json(['msg' => 'profile set successfully.','success'=>true], 200);
    }

    public function forgetPassword(Request $request){
        $request->validate([
            'email' => 'bail|required|email',          
        ]);
        $user = User::where('email',$request->email)->first();
      
        $password=rand(100000,999999);
        if($user){          
            $content = NotificationTemplate::where('title','Reset Password')->first()->mail_content;           
            $detail['user_name'] = $user->name;
            $detail['password'] = $password;
            $detail['app_name'] = Setting::find(1)->app_name;            
            try{
                Mail::to($user)->send(new ResetPassword($content,$detail));
            } catch (\Throwable $th) {  }
            User::find($user->id)->update(['password'=>Hash::make($password)]);            
            return response()->json(['success'=>true,'msg'=>'Please check your email new password will send on it.','data' =>null ], 200);
        }
        else{
            return response()->json(['success'=>false,'msg'=>'Invalid email ID','data' =>null ], 200);
        }
    }

    public function profile(){
        $data = Auth::user()->makeHidden(['created_at','updated_at']);
        return response()->json(['data' => $data,'success'=>true], 200);
    }

    public function events(){
        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone);                  
        $data['past'] =  Event::with(['ticket'])
        ->where([['status',1],['is_deleted',0],['user_id',Auth::user()->id],['start_time', '<=',$date->format('Y-m-d H:i:s')]])       
        ->orWhere([['status',1],['is_deleted',1],['user_id',Auth::user()->id],['start_time', '<=',$date->format('Y-m-d H:i:s')]])      
        ->orWhere([['status',1],['event_status','Cancel'],['user_id',Auth::user()->id],['start_time', '<=',$date->format('Y-m-d H:i:s')]])       
        ->orderBy('start_time','ASC')->get();  

        $data['draft'] =  Event::with(['ticket'])
        ->where([['status',0],['event_status','Pending'],['is_deleted',0],['user_id',Auth::user()->id]])
        ->orderBy('start_time','ASC')->get();  

        $data['upcoming'] =  Event::with(['ticket'])
        ->where([['status',1],['is_deleted',0],['user_id',Auth::user()->id],['start_time', '>=',$date->format('Y-m-d H:i:s')]])       
        ->where([['status',1],['event_status','Pending'],['user_id',Auth::user()->id],['start_time', '>=',$date->format('Y-m-d H:i:s')]])       
        ->orderBy('start_time','ASC')->get();   
        
      
        return response()->json(['data' => $data,'success'=>true], 200);
    }
    public function searchEvents(){        
        $data =  Event::with(['ticket'])
        ->where([['user_id',Auth::user()->id],['is_deleted',0]])       
        ->orderBy('start_time','ASC')->get();   
        return response()->json(['data' => $data,'success'=>true], 200);
        
    }

    public function scanner(){
        $data = User::role('scanner')->where('org_id',Auth::user()->id)->orderBy('id','DESC')->get();
        return response()->json(['data' => $data,'success'=>true], 200);
    }

    public function addScanner(Request $request){
        $request->validate([
            'first_name' => 'bail|required',
            'last_name' => 'bail|required',
            'email' => 'bail|required|email|unique:users',
            'phone' => 'bail|required',
            'password' => 'bail|required|min:6',
        ]);
        $data = $request->all();
        $data['org_id'] = Auth::user()->id;
        $data['password'] =  Hash::make($request->password); 
        $data['language'] = Setting::first()->language;
        $user = User::create($data);            
        $user->assignRole('scanner');
        return response()->json(['data' => $user,'success'=>true], 200);
    }

    public function addEvent(Request $request){
              
        $request->validate([
            'name' => 'bail|required',
            'image' => 'bail|required',
            'start_date' => 'bail|required|date_format:Y-m-d',
            'end_date' => 'bail|required|date_format:Y-m-d',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'scanner_id' => 'bail|required',
            'category_id' => 'bail|required|numeric',
            'type' => 'bail|required',  // offline & online
            'address' => 'bail|required_if:type,offline',           
            'lat' => 'bail|required_if:type,offline',
            'lang' => 'bail|required_if:type,offline',
            'status' => 'bail|required|numeric',
            'description' => 'bail|required',
            'people' => 'bail|required|numeric',                                     
        ]);         
        $data = $request->all();            
        $data['user_id'] = Auth::user()->id; 
        if($request->tags != null){
            $data['tags'] = array();
            foreach ($request->tags as $key) {          
                array_push( $data['tags'],$key['value']);
            }    
        }  
        if (isset($request->tags)) {
            if(count($data['tags']) > 0) {
                $data['tags'] = implode(',',$data['tags']);
            }
        }   
        if (isset($request->image)) {
            $data['image'] = (new AppHelper)->saveApiImage($request);
        } 
        
        $data['start_time'] = $request->start_date.' '.$request->start_time;     
        $data['end_time']  = $request->end_date.' '.$request->end_time;     
     
        $event = Event::create($data);
        return response()->json(['data' => $event,'success'=>true], 200);
    }

    public function editEvent(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'id' => 'bail|required|numeric',           
            'start_date' => 'bail|required|date_format:Y-m-d',
            'end_date' => 'bail|required|date_format:Y-m-d',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required', 
            'scanner_id' => 'bail|required',
            'category_id' => 'bail|required|numeric',
            'type' => 'bail|required',  // offline & online
            'address' => 'bail|required_if:type,offline',           
            'lat' => 'bail|required_if:type,offline',
            'lang' => 'bail|required_if:type,offline',
            'status' => 'bail|required|numeric',
            'description' => 'bail|required',
            'people' => 'bail|required|numeric',                                     
        ]); 
        $data = $request->all();                    
        if (isset($request->image)) {
            $data['image'] = (new AppHelper)->saveApiImage($request);
        } 
        $data['start_time'] = $request->start_date.' '.$request->start_time;     
        $data['end_time']  = $request->end_date.' '.$request->end_time;   

        
        if(isset($request->gallery)){
            $gallery = array();
            foreach (json_decode($request->gallery) as $value) {
                $img = $value;
                $img = str_replace('data:image/png;base64,', '', $img);
                $img = str_replace(' ', '+', $img);
                $img_code = base64_decode($img);
                $Iname = uniqid();
                $file = public_path('/images/upload/') . $Iname . ".png";
                $success = file_put_contents($file, $img_code);
                $image_name=$Iname . ".png";
                array_push($gallery,$image_name);
            }
            $data['gallery'] = implode(',',$gallery);
        }
        $event = Event::find($request->id)->update($data);

        return response()->json(['data' => $event,'success'=>true], 200);       
    }

    public function cancelEvent($id){
        Event::find($id)->update(['event_status'=>'Cancel']);
        return response()->json(['msg' => 'Event Canceled successfully.','success'=>true], 200);       
    }

    public function deleteEvent($id){
        Event::find($id)->update(['is_deleted'=>1,'event_status'=>'Deleted']);
        $ticket = Ticket::where('event_id',$id)->update(['is_deleted'=>1]);        
        return response()->json(['msg' => 'Event deleted successfully.','success'=>true], 200);   
    }

    public function eventDetail($id){
        $data = Event::with(['category:id,name'])->find($id);    
        $data->startTime = $data->start_time->format('h:i a');
        $data->endTime = $data->end_time->format('h:i a');  
        $data->tags = array_filter(explode(',',$data->tags));  
        $data->start__time = $data->start_time->format('Y-m-d\TH:i:s'.'.000000');
        $data->end__time =  $data->end_time->format('Y-m-d\TH:i:s'.'.000000');
        $gallery = array_filter(explode(',',$data->gallery)); 
        $g=array(); 
        if(count($gallery)>0){
            foreach ($gallery as  $value) {
                array_push($g,url('/').'/images/upload/'.$value);
            }
            $data->gallery = $g;
        }            
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function eventGuestList($id){
        $data = Order::with(['customer:name,id,email,phone','ticket:id,ticket_number'])->where('event_id',$id)->orderBy('id','DESC')->get()->each->setAppends([])->makeHidden(['payment_type','updated_at','payment_token','coupon_discount','coupon_id','order_status']);
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function orderDetail($id){
        $data = Order::with(['customer:name,id,email,phone','ticket:id,ticket_number'])->find($id)->setAppends([])->makeHidden(['updated_at','payment_token','coupon_discount','coupon_id','order_status']);
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function eventTickets($id){
        $data = Ticket::where('event_id',$id)->orderBy('id','DESC')->get();
        foreach ($data as $value) {
            $value->use_ticket = Order::where('ticket_id',$value->id)->sum('quantity');
        }
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function editImage(Request $request){
        $request->validate([
            'image' => 'bail|required',               
        ]);          
        if(isset($request->image))
        {           
            $image_name = (new AppHelper)->saveApiImage($request);
            User::find(Auth::user()->id)->update(['image'=>$image_name]);    
            return response()->json(['msg' => null, 'data' => null,'success'=>true], 200);
        }
        else{
            return response()->json(['msg' => null, 'data' => null,'success'=>false], 200);
        }    
        
    }

    public function ticketDetail($id){
        $data = Ticket::find($id);
        $data->use_ticket = Order::where('ticket_id',$data->id)->sum('quantity');
        $data->startTime = $data->start_time->format('Y-m-d\TH:i:s'.'.000000');
        $data->endTime =  $data->end_time->format('Y-m-d\TH:i:s'.'.000000');
    
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function addTicket(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'event_id'=> 'bail|required|numeric',
            'quantity' => 'bail|required',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'type' => 'bail|required',
            'ticket_per_order'=> 'bail|required',
            'description'=> 'bail|required',
            'price' =>  'bail|required_if:type,paid',   
            'status' =>  'bail|required',            
        ]);   
        $data = $request->all();       
        if($request->type=="free"){
            $data['price'] = 0;
        }
        $data['ticket_number'] = chr(rand(65,90)).chr(rand(65,90)).'-'.rand(999,10000);
        $event = Event::find($request->event_id); 
        $data['user_id'] = $event->user_id; 
        $ticket = Ticket::create($data);  
        return response()->json(['data' => $ticket,'success'=>true], 200);  
    }

   
    public function editTicket(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'event_id'=> 'bail|required|numeric',
            'id' => 'bail|required',
            'quantity' => 'bail|required',   
            'start_date' => 'bail|required|date_format:Y-m-d',
            'end_date' => 'bail|required|date_format:Y-m-d',
            'start_time' => 'bail|required',
            'end_time' => 'bail|required',
            'type' => 'bail|required',
            'ticket_per_order'=> 'bail|required',
            'description'=> 'bail|required',
            'status' =>  'bail|required',
            'price' =>  'bail|required_if:type,paid',            
        ]);   
        $data = $request->all();       
        if($request->type=="free"){
            $data['price'] = 0;
        }      
        $data['start_time'] = $request->start_date.' '.$request->start_time;     
        $data['end_time']  = $request->end_date.' '.$request->end_time;                
        Ticket::find($request->id)->update($data);  
        $ticket = Ticket::find($request->id);
        return response()->json(['data' => $ticket,'success'=>true], 200);  
    }

    public function deleteTicket($id){
        Ticket::find($id)->delete();
        return response()->json(['msg' => 'Ticket deleted successfully.','success'=>true], 200);  
    }
    
    public function allCategory(){
        $data = Category::where('status',1)->orderBy('id','DESC')->get();  
        return response()->json(['data' => $data,'success'=>true], 200);  
    }

    public function organizationSetting(){
        $data = Setting::find(1,['currency','default_lat','default_long','privacy_policy_organizer','terms_use_organizer','app_version','or_onesignal_app_id','or_onesignal_project_number','footer_copyright']);        
        $data->currency_symbol = Currency::where('code',$data->currency)->first()->symbol;
        return response()->json(['data' => $data,'success'=>true], 200);    
    }
    
    public function viewTax(){
        $data = Tax::where('user_id',Auth::user()->id)->orderBy('id','DESC')->get();
        return response()->json(['data' => $data,'success'=>true], 200);    
    }

    public function taxDetail($id){
        $data = Tax::find($id);
        return response()->json(['data' => $data,'success'=>true], 200);    
    }

    public function deleteOrder($id){
        $data = Order::find($id);
        $data->delete();
        return response()->json(['msg' => 'Order deleted successfully.','success'=>true], 200);    
    }
    
    public function addTax(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'price' => 'bail|required|numeric',
            'allow_all_bill'=> 'bail|required|numeric',            
        ]);   
        $data = $request->all();
        $data['user_id'] = Auth::user()->id;
        $tax = Tax::create($data);
        return response()->json(['data' => $tax,'success'=>true], 200);    
    }

    public function editTax(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'id' => 'bail|required',
            'price' => 'bail|required|numeric',
            'allow_all_bill'=> 'bail|required|numeric',           
        ]);   
        $data = $request->all();        
        Tax::find($request->id)->update($data);
        $tax =Tax::find($request->id);
        return response()->json(['data' => $tax,'success'=>true], 200);    
    }

    public function deleteTax($id){
        Tax::find($id)->delete();
        return response()->json(['msg' =>'Tax deleted successfully.' ,'success'=>true], 200);    

    }

    public function changeStatusTax($id,$status){
        Tax::find($id)->update(['status'=>$status]);
        $data = Tax::find($id);
        return response()->json(['data' =>$data ,'success'=>true], 200);    

    }

    public function viewFaq(){
        $data = Faq::where('status',1)->orderBy('id','DESC')->get()->makeHidden(['created_at','updated_at']);
        return response()->json(['data' => $data,'success'=>true], 200);    
    }

    public function addFeedback(Request $request){
        $request->validate([
            'email' => 'bail|required|email',
            'message' => 'bail|required',
            'rate' => 'bail|required|numeric',          
        ]);   
        $data = $request->all();        
        $data['user_id'] = Auth::user()->id;
        $feedback = Feedback::create($data);
        return response()->json(['data' => $feedback,'success'=>true], 200);   
    }

    public function changePassword(Request $request){
        $request->validate([
            'old_password' => 'bail|required',
            'password' => 'bail|required|min:6',
            'password_confirmation' => 'bail|required|same:password|min:6'
        ]);
        if (Hash::check($request->old_password, Auth::user()->password)){
            User::find(Auth::user()->id)->update(['password'=>Hash::make($request->password)]);            
            return response()->json(['success'=>true,'msg'=>'Your password is change successfully','data' =>null ], 200);
        }
        else{
            return response()->json(['success'=>false,'msg'=>'Current Password is wrong!','data' =>null ], 200);
        }
    }

    public function editProfile(Request $request){
        User::find(Auth::user()->id)->update($request->all());
        $user = User::find(Auth::user()->id);
        return response()->json(['success'=>true,'msg'=>null,'data' =>$user ], 200);
    }

    public function followers(){
        $user_id = Auth::user()->followers;
        $user  = AppUser::whereIn('id',$user_id)->get()->makeHidden(['created_at','updated_at','provider_token','provider','lang','lat','favorite','email_verified_at']);
        return response()->json(['success'=>true,'msg'=>null,'data' =>$user ], 200);        
    }

    public function notifications(){
        $data = Notification::where('organizer_id',Auth::user()->id)->orderBy('id','DESC')->get()->each->setAppends(['event']);
        return response()->json(['success'=>true,'msg'=>null,'data' =>$data ], 200);
    }

    public function clearNotification(){
        $noti = Notification::where('organizer_id',Auth::user()->id)->get();        
        foreach ($noti as $value) {
            $value->delete();
        }
        return response()->json(['success'=>true,'msg'=>'Notification deleted successfully.' ], 200);
    }

    public function couponEvent(){
        $data = Event::where([['status',1],['is_deleted',0],['event_status','Pending'],['user_id',Auth::user()->id]])->orderBy('id','DESC')->get(['id','name'])->each->setAppends([]);
        return response()->json(['success'=>true,'msg'=>null,'data' =>$data ], 200); 
    }

    public function coupons(){
        $coupon = Coupon::with(['event:id,name,image'])->where('user_id',Auth::user()->id)->OrderBy('id','DESC')->get()->makeHidden(['created_at','updated_at']);            
        return response()->json(['success'=>true,'msg'=>null,'data' =>$coupon ], 200);
    }

    public function addCoupon(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'event_id' => 'bail|required',
            'discount' => 'bail|required',
            'start_date' => 'bail|required|date_format:Y-m-d',
            'end_date' => 'bail|required|date_format:Y-m-d',
            'max_use' => 'bail|required',
            'description' => 'bail|required',        
        ]);   
        $data = $request->all(); 
        $data['user_id'] = Auth::user()->id;
        $data['status'] = 1;
        $data['coupon_code'] =  chr(rand(65,90)).chr(rand(65,90)).'-'.rand(9999,100000);
        $coupon =  Coupon::create( $data);
        return response()->json(['success'=>true,'msg'=>null,'data' =>$coupon ], 200);
    }

    public function editCoupon(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'id' => 'bail|required',
            'event_id' => 'bail|required',
            'discount' => 'bail|required',
            'start_date' => 'bail|required|date_format:Y-m-d',
            'end_date' => 'bail|required|date_format:Y-m-d',
            'max_use' => 'bail|required',
            'description' => 'bail|required',        
        ]);   
        $data = $request->all();                         
        $coupon =  Coupon::find($request->id)->update($data);        
        return response()->json(['success'=>true,'msg'=>null,'data' =>$coupon ], 200);
    }

    public function couponDetail($id){
        $data = Coupon::find($id)->makeHidden(['created_at','updated_at']);
        $data->event_name = Event::find($data->event_id)->name;
        return response()->json(['success'=>true,'msg'=>null,'data' =>$data ], 200);
    }

    public function deleteCoupon($id){
        $data = Coupon::find($id);
        $data->delete();
        return response()->json(['success'=>true,'msg'=>'Coupon deleted successfully.' ], 200);
    }

    public function  removeGalleryImage(Request $request){
        $request->validate([
            'image' => 'bail|required',   
            'id' => 'bail|required',          
        ]);
        $gallery = array_filter(explode(',',Event::find($request->id)->gallery)); 
        if(count(array_keys($gallery,$request->image))>0){
            if (($key = array_search($request->image, $gallery)) !== false) {
                unset($gallery[$key]);
            }
        }
        $aa =implode(',',$gallery);
        $data= Event::find($request->id);
        $data->gallery =$aa;
        $data->update();    
        return response()->json(['success'=>true,'msg'=>null ], 200);
    }

}