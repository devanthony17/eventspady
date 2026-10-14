<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use App\Models\Review;
use App\Models\Ticket;
use App\Models\Coupon;
use App\Models\Tax;
use App\Models\OrderTax;
use App\Models\AppUser;
use App\Models\Category;
use App\Models\Blog;
use App\Models\Order;
use App\Models\Setting;
use App\Models\PaymentSetting;
use App\Models\NotificationTemplate;
use App\Models\EventReport;
use App\Models\OrderChild;
use App\Models\Notification;
use Auth;
use App;
use Config;
use OneSignal;
use Stripe;
use Rave;
use QrCode;
use Redirect;
use Carbon\Carbon;
use App\Mail\ResetPassword;
use App\Mail\TicketBook;
use App\Mail\TicketBookOrg;
use App\Models\Language;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

use Artesaos\SEOTools\Facades\JsonLdMulti;
use Artesaos\SEOTools\Facades\SEOTools;
use Artesaos\SEOTools\Facades\SEOMeta;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\JsonLd;


class FrontendController extends Controller
{
    public function home(){
        if(env('DB_DATABASE')==null){              
            return view('admin.frontpage');
        }
        else{
            $setting = Setting::first(['app_name','logo']);

            SEOMeta::setTitle($setting->app_name.' - Home' ?? env('APP_NAME'))
            ->setDescription('This is home page')
            ->setCanonical(url()->current())
            ->addKeyword(['home page', $setting->app_name , $setting->app_name.' Home']);

            OpenGraph::setTitle($setting->app_name.' - Home' ?? env('APP_NAME'))
            ->setDescription('This is home page')
            ->setUrl(url()->current());

            JsonLdMulti::setTitle($setting->app_name.' - Home' ?? env('APP_NAME'));
            JsonLdMulti::setDescription('This is home page');
            JsonLdMulti::addImage($setting->imagePath . $setting->logo);
         
            SEOTools::setTitle($setting->app_name.' - Home' ?? env('APP_NAME'));
            SEOTools::setDescription('This is home page');
            SEOTools::opengraph()->setUrl(url()->current());
            SEOTools::setCanonical(url()->current());
            SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
            
            $timezone = Setting::find(1)->timezone;       
            $date = Carbon::now($timezone);      
            $events  = Event::with(['category:id,name'])
            ->where([['status',1],['is_deleted',0],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]])              
            ->orderBy('start_time','ASC')->get();
            $organizer = User::role('organization')->orderBy('id','DESC')->get();
            $category = Category::where('status',1)->orderBy('id','DESC')->get();
            $blog = Blog::with(['category:id,name'])->where('status',1)->orderBy('id','DESC')->get();
            foreach ($events as $value) {
                $value->total_ticket = Ticket::where([['event_id',$value->id],['is_deleted',0],['status',1]])->sum('quantity');
                $value->sold_ticket = Order::where('event_id',$value->id)->sum('quantity');
                $value->available_ticket = $value->total_ticket - $value->sold_ticket;
            }
            return view('frontend.home',compact('events','organizer','category','blog'));
        }
        
    }

    public function login(){
        $setting = Setting::first(['app_name','logo']);
        SEOMeta::setTitle($setting->app_name.' - Login' ?? env('APP_NAME'))
        ->setDescription('This is login page')
        ->setCanonical(url()->current())
        ->addKeyword(['login page', $setting->app_name , $setting->app_name.' Login', 'sign-in page', $setting->app_name.' sign-in']);

        OpenGraph::setTitle($setting->app_name.' - Login' ?? env('APP_NAME'))
        ->setDescription('This is login page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Login' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is login page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
        
        SEOTools::setTitle($setting->app_name.' - Login' ?? env('APP_NAME'));
        SEOTools::setDescription('This is login page');
        SEOTools::opengraph()->addProperty('keywords',
        ['login page', $setting->app_name , $setting->app_name.' Login',
         'sign-in page', $setting->app_name.' sign-in'
        ]);
        SEOTools::opengraph()->addProperty('image', $setting->imagePath . $setting->logo);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        return view('frontend.auth.login');
    }
    
    public function userLogin(Request $request){        
        $request->validate([
            'email' => 'bail|required|email',
            'password' => 'bail|required',
        ]);            
        $userdata = array(
            'email' => $request->email,
            'password' => $request->password,     
            'status'=> 1,     
        );   
        if (Auth::guard('appuser')->attempt($userdata)) 
        {
            $user =  Auth::guard('appuser')->user();
            $this->setLanguage($user);                     
            return redirect('/');                                                       
        } 
        else{
            return Redirect::back()->with('error_msg', 'Invalid Username or Password.');
        }           
    }
    
    public function register(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Register' ?? env('APP_NAME'))
        ->setDescription('This is register page')
        ->setCanonical(url()->current())
        ->addKeyword(['register page', $setting->app_name , $setting->app_name.' Register',
        'sign-up page', $setting->app_name.' sign-up']);

        OpenGraph::setTitle($setting->app_name.' - Register' ?? env('APP_NAME'))
        ->setDescription('This is register page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Register' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is register page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
        
        SEOTools::setTitle($setting->app_name.' - Register' ?? env('APP_NAME'));
        SEOTools::setDescription('This is register page');
        SEOTools::opengraph()->addProperty('keywords',
            ['register page', $setting->app_name ,
             $setting->app_name.' Register',
             'sign-up page', $setting->app_name.' sign-up'
            ]);
        SEOTools::opengraph()->addProperty('image', $setting->imagePath . $setting->logo);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        return view('frontend.auth.register');
    }
    
    public function userRegister(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'last_name' => 'bail|required',
            'email' => 'bail|required|email|unique:app_user',
            'phone' => 'bail|required|numeric',
            'password' => 'bail|required|min:6',
        ]);
        $data = $request->all();
        $data['password'] = Hash::make($request->password);   
        $data['image'] ="defaultuser.png";
        $data['status'] =1; 
        $data['provider'] ="LOCAL";
        $data['language'] = Setting::first()->language;
        $user = AppUser::create($data);
        if(Auth::guard('appuser')->loginUsingId($user->id))
        {
            $this->setLanguage($user);
            return redirect('/');
        }
        return redirect($request->url); 
    }
    
    public function resetPassword(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - reset password' ?? env('APP_NAME'))
        ->setDescription('This is reset password page')
        ->setCanonical(url()->current())
        ->addKeyword(['reset password page', $setting->app_name , $setting->app_name.' reset password',
        'forgot password page', $setting->app_name.' forgot password']);

        OpenGraph::setTitle($setting->app_name.' - reset password' ?? env('APP_NAME'))
        ->setDescription('This is reset password page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - reset password' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is reset password page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
        
        SEOTools::setTitle($setting->app_name.' - reset password' ?? env('APP_NAME'));
        SEOTools::setDescription('This is reset password page');
        SEOTools::opengraph()->addProperty('keywords',
            ['reset password page', $setting->app_name ,
             $setting->app_name.' reset password',
             'forgot password page', $setting->app_name.' forgot password'
            ]);
        SEOTools::opengraph()->addProperty('image', $setting->imagePath . $setting->logo);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        return view('frontend.auth.resetPassword');
    } 
    
    public function userResetPassword(Request $request){
        $request->validate([            
            'email' => 'bail|required|email',
        ]);
        $user = AppUser::where('email',$request->email)->first();
        $password=rand(100000,999999);
        if($user){           
            $content = NotificationTemplate::where('title','Reset Password')->first()->mail_content;            
            $detail['user_name'] = $user->name;
            $detail['password'] = $password;
            $detail['app_name'] = Setting::find(1)->app_name;   
            AppUser::find($user->id)->update(['password'=> Hash::make($password)]);         
            try{
                Mail::to($user)->send(new ResetPassword($content,$detail));
            } catch (\Throwable $th) {  }
            return Redirect::back()->with('success_msg', 'New password will send in your mail, please check it.');
        }
        else{
            return Redirect::back()->with('error_msg', 'Invalid Email Id, Please try another.');
        }
    }
    
    public function orgRegister(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Organizer Register' ?? env('APP_NAME'))
        ->setDescription('This is organizer register page')
        ->setCanonical(url()->current())
        ->addKeyword(['organizer register page', $setting->app_name , $setting->app_name.' Organizer Register',
        'organizer sign-up page', $setting->app_name.' organizer sign-up']);

        OpenGraph::setTitle($setting->app_name.' - Organizer Register' ?? env('APP_NAME'))
        ->setDescription('This is organizer register page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Organizer Register' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is organizer register page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
        
        SEOTools::setTitle($setting->app_name.' - Organizer Register' ?? env('APP_NAME'));
        SEOTools::setDescription('This is register page');
        SEOTools::opengraph()->addProperty('keywords',
            ['register page', $setting->app_name ,
             $setting->app_name.' Organizer Register',
             'organizer sign-up page', $setting->app_name.' organizer sign-up'
            ]);
        SEOTools::opengraph()->addProperty('image', $setting->imagePath . $setting->logo);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        return view('frontend.auth.orgRegister');
    }
    
    public function organizerRegister(Request $request){
        $request->validate([
            'name' => 'bail|required',
            'first_name' => 'bail|required',
            'last_name' => 'bail|required',
            'email' => 'bail|required|email|unique:users',
            'phone' => 'bail|required|numeric',
            'password' => 'bail|required|min:6',
            'confirm_password' => 'bail|required|min:6|same:password',
            'country' => 'bail|required',
        ]);
        $data = $request->all();
        $data['password'] = Hash::make($request->password); 
        $data['image'] = 'defaultuser.png';      
        $data['language'] = Setting::first()->language;  
        $user = User::create($data);
        $user->assignRole('organization');
        return redirect('login');          
    }
    
    public function allEvents(Request $request){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'))
        ->setDescription('This is all events page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'all event page',
            $setting->app_name,
            $setting->app_name.' All-Events',
            'events page',
            $setting->app_name.' Events',
            ]);

        OpenGraph::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'))
        ->setDescription('This is all events page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is all events page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
     
        SEOTools::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'));
        SEOTools::setDescription('This is all events page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            'all event page',
            $setting->app_name,
            $setting->app_name.' All-Events',
            'events page',
            $setting->app_name.' Events',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone);
        $events  = Event::with(['category:id,name'])
        ->where([['status',1],['is_deleted',0],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]]);                      

        $chip = array();
        if($request->has('type') && $request->type!= null){
            $chip['type'] = $request->type;
            $events = $events->where('type',$request->type);
        }
        if($request->has('category') && $request->category!= null){
            $chip['category'] = Category::find($request->category)->name;
            $events = $events->where('category_id',$request->category);
        }
        if($request->has('duration') && $request->duration!= null){
            $chip['date'] = $request->duration;           
        }
        $events = $events->orderBy('start_time','ASC')->get();
        foreach ($events as $value) {
            $value->total_ticket = Ticket::where([['event_id',$value->id],['is_deleted',0],['status',1]])->sum('quantity');
            $value->sold_ticket = Order::where('event_id',$value->id)->sum('quantity');
            $value->available_ticket = $value->total_ticket - $value->sold_ticket;
        }
        return view('frontend.events',compact('events','chip'));

    }
    
    public function eventDetail($id,$name){
        $setting = Setting::first(['app_name','logo']);
        $data = Event::with(['category:id,name,image','organization:id,first_name,name,bio,last_name,image'])->find($id);      

        SEOMeta::setTitle($data->name)
        ->setDescription($data->description)
        ->addMeta('event:category', $data->category->name, 'property')
        ->addKeyword([
            $setting->app_name,
            $data->name,
            $setting->app_name.' - '.$data->name,
            $data->category->name,
            $data->tags
         ]);

        OpenGraph::setTitle($data->name)
        ->setDescription($data->description)
        ->setUrl(url()->current())
        ->addImage($data->imagePath . $data->image)
        ->setArticle([
            'start_time' => $data->start_time,
            'end_time' => $data->end_time,
            'organization' => $data->organization->name,
            'catrgory' => $data->category->name,
            'type' => $data->type,
            'address' => $data->address,
            'tag' => $data->tags,
        ]);
        
        JsonLd::setTitle($data->name)
        ->setDescription($data->description)
        ->setType('Article')
        ->addImage($data->imagePath . $data->image);

        SEOTools::setTitle($data->name);
        SEOTools::setDescription($data->description);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $data->name,
            $setting->app_name.' - '.$data->name,
            $data->category->name,
            $data->tags
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        SEOTools::jsonLd()->addImage($data->imagePath . $data->image);

        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone); 
        $data->paid_ticket =  Ticket::where([['event_id',$data->id],['is_deleted',0],['type','paid'],['status',1],['end_time', '>=',$date->format('Y-m-d H:i:s')],['start_time', '<=',$date->format('Y-m-d H:i:s')]])->orderBy('id','DESC')->get();
        $data->free_ticket = Ticket::where([['event_id',$data->id],['is_deleted',0],['type','free'],['status',1],['end_time', '>=',$date->format('Y-m-d H:i:s')],['start_time', '<=',$date->format('Y-m-d H:i:s')]])->orderBy('id','DESC')->get();

        $data->review = Review::where('event_id',$data->id)->orderBy('id','DESC')->get();
        foreach ($data->paid_ticket as $value) {
            $used = Order::where('ticket_id',$value->id)->sum('quantity');
            $value->available_qty = $value->quantity - $used;
        }
        
        foreach ($data->free_ticket as $value) {
            $used = Order::where('ticket_id',$value->id)->sum('quantity');
            $value->available_qty = $value->quantity - $used;
        }
        return view('frontend.eventDetail',compact('data'));
    }
    
    public function orgDetail($id,$name){
        $setting = Setting::first(['app_name','logo']);
        $data = User::find($id);

        SEOMeta::setTitle($data->first_name .' '. $data->last_name)
        ->setDescription($data->bio)
        ->addKeyword([
            $setting->app_name,
            $data->name,
            $data->first_name.' '.$data->last_name,
         ]);

        OpenGraph::setTitle($data->first_name .' '. $data->last_name)
            ->setDescription($data->bio)
            ->setType('profile')
            ->setUrl(url()->current())
            ->addImage($data->imagePath . $data->image)
            ->setProfile([
                'first_name' => $data->first_name,
                'last_name' => $data->last_name,
                'username' => $data->name,
                'email' => $data->email,
                'bio' => $data->bio,
                'country' => $data->country,
            ]);
        
        JsonLd::setTitle($data->first_name .' '. $data->last_name)
        ->setDescription($data->bio)
        ->setType('Profile')
        ->addImage($data->imagePath . $data->image);

        SEOTools::setTitle($data->first_name .' '. $data->last_name);
        SEOTools::setDescription($data->bio);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $data->name,
            $data->first_name.' '.$data->last_name,
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        SEOTools::jsonLd()->addImage($data->imagePath . $data->image);

        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone);   
        $data->total_event = Event::where([['status',1],['is_deleted',0],['user_id',$id],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]])->count();        
        $data->events = Event::where([['status',1],['is_deleted',0],['user_id',$id],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]])              
        ->orderBy('start_time','ASC')->paginate(6);
        return view('frontend.orgDetail',compact('data'));
    }
    
    public function reportEvent(Request $request){
        $data = $request->all();
        if(Auth::check()){
            $data['user_id'] = Auth::user()->id;
        }        
        EventReport::create($data);
        return redirect()->back()->withStatus(__('Report is submitted successfully.'));  
    }

    public function checkout($id){
        $data = Ticket::find($id);
        $data->event = Event::find($data->event_id);
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($data->name)
        ->setDescription($data->description)
        ->addKeyword([
            $setting->app_name,
            $data->name,
            $data->event->name,
            $data->event->tags
         ]);

        OpenGraph::setTitle($data->name)
        ->setDescription($data->description)
        ->setUrl(url()->current());
        
        JsonLd::setTitle($data->name)
        ->setDescription($data->description);

        SEOTools::setTitle($data->name);
        SEOTools::setDescription($data->description);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $data->name,
            $data->event->name,
            $data->event->tags
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        $used = Order::where('ticket_id',$id)->sum('quantity');
        $data->available_qty = $data->quantity - $used;
        $data->tax = Tax::where([['user_id',$data->event->user_id],['allow_all_bill',1],['status',1]])->orderBy('id','DESC')->get()->makeHidden(['created_at','updated_at']);        
        $data->tax_total = Tax::where([['user_id',$data->event->user_id],['allow_all_bill',1],['status',1]])->sum('price');
        $data->currency_code = Setting::find(1)->currency;
        return view('frontend.checkout',compact('data'));
    }
    
    public function createOrder(Request $request){
        $data = $request->all();
        $ticket = Ticket::find($request->ticket_id);
        $event = Event::find($ticket->event_id);
        
        $org = User::find($event->user_id);
        $user = AppUser::find(Auth::guard('appuser')->user()->id);
        $data['order_id'] = '#'.rand(9999,100000);
        $data['event_id'] = $event->id;
        $data['customer_id'] = $user->id;
        $data['organization_id'] = $org->id;
        $data['order_status'] = 'Pending';  
        if($request->payment_type=='LOCAL' ||$request->payment_type=='FLUTTERWAVE' ){            
            $data['payment_status'] = 0;
        }
        else{
            $data['payment_status'] = 1;
        }
        $com = Setting::find(1,['org_commission_type','org_commission']);
        $p =   $request->payment- $request->tax; 
        if($request->payment_type=="FREE"){
            $data['org_commission']  = 0;
        }
        else{
            if($com->org_commission_type == "percentage"){
                $data['org_commission'] =  $p*$com->org_commission/100;
            }
            else if($com->org_commission_type=="amount"){
                $data['org_commission']  = $com->org_commission;
            }
        }
        
        if($request->payment_type == "STRIPE"){  
            $currency_code = Setting::first()->currency;  
            $stripe_payment = $currency_code == "USD" || $currency_code == "EUR" ? $request->payment * 100 : $request->payment;

            $cur = Setting::find(1)->currency;        
            $stripe_secret =  PaymentSetting::find(1)->stripeSecretKey;  
            Stripe\Stripe::setApiKey($stripe_secret);
            $token = $_POST['stripeToken'];
            $stripeDetail =  Stripe\Charge::create ([
                    "amount" => $stripe_payment,
                    "currency" => $cur,
                    "source" => $token,
            ]);         
            $data['payment_token'] = $stripeDetail->id;
        } 

        if($request->coupon_id != null){      
            $count = Coupon::find($request->coupon_id)->use_count;
            $count = $count +1;           
            Coupon::find($request->coupon_id)->update(['use_count'=>$count]);
        } 
          
           
        $order = Order::create($data);
        for ($i=1; $i <= $request->quantity; $i++) { 
            $child['ticket_number'] = uniqid();
            $child['ticket_id'] = $request->ticket_id;
            $child['order_id'] = $order->id;
            $child['customer_id'] = Auth::guard('appuser')->user()->id;
            OrderChild::create($child);         
        } 
        if(isset($request->tax_data)){
            foreach (json_decode($data['tax_data']) as $value) {
                $tax['order_id'] = $order->id;
                $tax['tax_id'] = $value->id;
                $tax['price'] = $value->price;             
                OrderTax::create($tax);
            }
        }
        
        $user = AppUser::find($order->customer_id);
        $setting = Setting::find(1);
        
        // for user notification
        $message = NotificationTemplate::where('title','Book Ticket')->first()->message_content;
        $detail['user_name'] = $user->name.' '.$user->last_name;
        $detail['quantity'] = $request->quantity;
        $detail['event_name'] = Event::find($order->event_id)->name;
        $detail['date'] = Event::find($order->event_id)->start_time->format('d F Y h:i a');
        $detail['app_name'] =$setting->app_name;
        $noti_data = ["{{user_name}}", "{{quantity}}","{{event_name}}","{{date}}","{{app_name}}"];
        $message1 = str_replace($noti_data, $detail, $message);
        $notification = array();
        $notification['organizer_id']= null;
        $notification['user_id']= $user->id;
        $notification['order_id']= $order->id;
        $notification['title']= 'Ticket Booked';
        $notification['message']= $message1;
        Notification::create($notification);
        if($setting->push_notification==1){
            if($user->device_token!=null){
                Config::set('onesignal.app_id', env('APP_ID'));
                Config::set('onesignal.rest_api_key', env('REST_API_KEY'));
                Config::set('onesignal.user_auth_key', env('USER_AUTH_KEY'));
                try{
                    OneSignal::sendNotificationToUser(
                        $message1,
                        $user->device_token,
                        $url = null,
                        $data1 = null,
                        $buttons = null,
                        $schedule = null
                    );
                }catch (\Throwable $th) { }
            }
        }
        // for user mail
        $ticket_book = NotificationTemplate::where('title','Book Ticket')->first();
        $details['user_name']= $user->name.' '.$user->last_name;
        $details['quantity']= $request->quantity;
        $details['event_name']= Event::find($order->event_id)->name;
        $details['date']= Event::find($order->event_id)->start_time->format('d F Y h:i a');
        $details['app_name'] = $setting->app_name;
        if($setting->mail_notification == 1)
        {
            try{
                Mail::to($user->email)->send(new TicketBook($ticket_book->mail_content, $details, $ticket_book->subject));
            }
            catch (\Throwable $th) {}
        }

        // for Organizer notification
        $org =  User::find($order->organization_id);
        $or_message = NotificationTemplate::where('title','Organizer Book Ticket')->first()->message_content;
        $or_detail['organizer_name'] = $org->first_name .' '. $org->last_name;  
        $or_detail['user_name'] = $user->name.' '.$user->last_name;
        $or_detail['quantity'] = $request->quantity;
        $or_detail['event_name'] = Event::find($order->event_id)->name;
        $or_detail['date'] = Event::find($order->event_id)->start_time->format('d F Y h:i a');
        $or_detail['app_name'] =$setting->app_name;
        $or_noti_data = ["{{organizer_name}}", "{{user_name}}", "{{quantity}}","{{event_name}}","{{date}}","{{app_name}}"];
        $or_message1 = str_replace($or_noti_data, $or_detail, $or_message);
        $or_notification = array();
        $or_notification['organizer_id']=  $org->id;
        $or_notification['user_id']= null;
        $or_notification['order_id']= $order->id;
        $or_notification['title']= 'New Ticket Booked';
        $or_notification['message']= $or_message1;      
        Notification::create($or_notification);
        if($setting->push_notification==1){
            if($org->device_token!=null){
                Config::set('onesignal.app_id', env('ORG_APP_ID'));
                Config::set('onesignal.rest_api_key', env('ORG_REST_API_KEY'));
                Config::set('onesignal.user_auth_key', env('ORG_USER_AUTH_KEY'));
                try{
                    OneSignal::sendNotificationToUser(
                        $or_message1,
                        $org->device_token,
                        $url = null,
                        $data1 = null,
                        $buttons = null,
                        $schedule = null
                    );
                }catch (\Throwable $th) { }
            }
        }
        // for Organizer mail
        $new_ticket = NotificationTemplate::where('title','Organizer Book Ticket')->first();
        $details1['organizer_name']= $org->first_name .' '. $org->last_name;
        $details1['user_name'] = $user->name.' '.$user->last_name;
        $details1['quantity']= $request->quantity;
        $details1['event_name']= Event::find($order->event_id)->name;
        $details1['date']= Event::find($order->event_id)->start_time->format('d F Y h:i a');
        $details1['app_name'] = $setting->app_name;
        if($setting->mail_notification == 1)
        {
            try{
                Mail::to($user->email)->send(new TicketBookOrg($new_ticket->mail_content, $details1, $new_ticket->subject));
            }
            catch (\Throwable $th) {}
        }

        if($request->payment_type=="FLUTTERWAVE"){
            return redirect('web/create-payment/'.$order->id);
        }
        return redirect('my-tickets');        
    }
    
    public function categoryEvents($id,$name){ 
        $setting = Setting::first(['app_name','logo']);
        $category = Category::find($id);

        SEOMeta::setTitle($setting->app_name.'- Events' ?? env('APP_NAME'))
        ->setDescription('This is category events page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'category event page',
            $category->name.' - Events',
            $setting->app_name,
            $setting->app_name.' Events',
            'events page',
            ]);

        OpenGraph::setTitle($setting->app_name.' - Events' ?? env('APP_NAME'))
        ->setDescription('This is category events page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Events' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is category events page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
     
        SEOTools::setTitle($setting->app_name.' - Events' ?? env('APP_NAME'));
        SEOTools::setDescription('This is category events page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            'category event page',
            $category->name.' - Events',
            $setting->app_name,
            $setting->app_name.' Events',
            'events page',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone);      
        $events  = Event::with(['category:id,name'])
        ->where([['status',1],['is_deleted',0],['category_id',$id],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]])              
        ->orderBy('start_time','ASC')->get();

        return view('frontend.events',compact('events','category'));
    }
    
    public function eventType($type){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'))
        ->setDescription('This is all events page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'all event page',
            $setting->app_name,
            $setting->app_name.' All-Events',
            'events page',
            $setting->app_name.' Events',
            ]);

        OpenGraph::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'))
        ->setDescription('This is all events page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is all events page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
     
        SEOTools::setTitle($setting->app_name.' - All-Events' ?? env('APP_NAME'));
        SEOTools::setDescription('This is all events page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            'all event page',
            $setting->app_name,
            $setting->app_name.' All-Events',
            'events page',
            $setting->app_name.' Events',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        
        $timezone = Setting::find(1)->timezone;       
        $date = Carbon::now($timezone);   
        if($type=="all"){          
            $events  = Event::with(['category:id,name'])
            ->where([['status',1],['is_deleted',0],['event_status','Pending'],['end_time', '>',$date->format('Y-m-d H:i:s')]])
            ->orderBy('start_time','ASC')->get();

            return view('frontend.events',compact('events'));
        }
        else{          
            $events  = Event::with(['category:id,name'])
            ->where([['status',1],['is_deleted',0],['event_status','Pending'],['type',$type],['end_time', '>',$date->format('Y-m-d H:i:s')]])
            ->orderBy('start_time','ASC')->get();
            return view('frontend.events',compact('events','type'));
        }       
    }
    
    public function allCategory(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Category' ?? env('APP_NAME'))
        ->setDescription('This is all category page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'all event page',
            $setting->app_name,
            $setting->app_name.' Category',
            'category page',
            $setting->app_name.' category',
            ]);

        OpenGraph::setTitle($setting->app_name.' - Category' ?? env('APP_NAME'))
        ->setDescription('This is all category page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Category' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is all category page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
     
        SEOTools::setTitle($setting->app_name.' - Category' ?? env('APP_NAME'));
        SEOTools::setDescription('This is all category page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            'all event page',
            $setting->app_name,
            $setting->app_name.' Category',
            'category page',
            $setting->app_name.' category',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        $data = Category::where('status',1)->orderBy('id','DESC')->get();
        return view('frontend.allCategory',compact('data'));        
    }
    
    public function blogs(){
        $blogs = Blog::where('status',1)->orderBy('id','DESC')->get();
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Blogs' ?? env('APP_NAME'))
        ->setDescription('This is blogs page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'blogs page',
            $setting->app_name,
            $setting->app_name.' Blogs',
            'blog page',
            ]);

        OpenGraph::setDescription('This is blogs page');
        OpenGraph::setTitle($setting->app_name.' - Blogs' ?? env('APP_NAME'));
        OpenGraph::setUrl(url()->current());
        OpenGraph::addProperty('type', 'blogs');

        JsonLd::setTitle($setting->app_name.' - Blogs' ?? env('APP_NAME'));
        JsonLd::setDescription('This is blogs page');
        JsonLd::addImage($setting->imagePath . $setting->logo);

        SEOTools::setTitle($setting->app_name.' - Blogs' ?? env('APP_NAME'));
        SEOTools::setDescription('This is blogs page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('type', 'blogs');
        return view('frontend.blog',compact('blogs'));
    }
    
    public function blogDetail($id,$name){
        $setting = Setting::first(['app_name','logo']);

        $data = Blog::find($id);
        SEOMeta::setTitle($data->title);
        SEOMeta::setDescription($data->description);
        SEOMeta::addMeta('blog:published_time', $data->created_at->toW3CString(), 'property');
        SEOMeta::addMeta('blog:category', $data->category->name, 'property');
        SEOMeta::addKeyword($data->tags);

        OpenGraph::setTitle($data->title)
        ->setDescription($data->description)
        ->setType('blog')
        ->addImage($data->imagePath . $data->image)
        ->setArticle([
            'published_time' => $data->created_at,
            'modified_time' => $data->updated_at,
            'section' => $data->category->name,
            'tag' => $data->tags
        ]);
      
        JsonLd::setTitle($data->title);
        JsonLd::setDescription($data->description);
        JsonLd::setType('Blog');
        JsonLd::addImage($data->imagePath . $data->image);
        return view('frontend.blogDetail',compact('data'));
    }
    
    public function profile(){
        $user = Auth::guard('appuser')->user();  
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle('User Profile')
        ->setDescription('This is user profile page')
        ->addKeyword([
            $setting->app_name,
            $user->name,
            $user->name.' '.$user->last_name,
         ]);

        OpenGraph::setTitle('User Profile')
            ->setDescription('This is user profile page')
            ->setType('profile')
            ->setUrl(url()->current())
            ->addImage($user->imagePath . $user->image)
            ->setProfile([
                'first_name' => $user->name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'bio' => $user->bio,
                'country' => $user->country,
            ]);
        
        JsonLd::setTitle('User Profile' ?? env('APP_NAME'))
        ->setDescription('This is user profile page')
        ->setType('Profile')
        ->addImage($user->imagePath . $user->image);

        SEOTools::setTitle('User Profile' ?? env('APP_NAME'));
        SEOTools::setDescription('This is user profile page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $user->name,
            $user->name.' '.$user->last_name,
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        SEOTools::jsonLd()->addImage($user->imagePath . $user->image);
        
        $user->saved_event = Event::whereIn('id',array_filter(explode(',',$user->favorite)))->where([['status',1],['is_deleted',0]])->get();       
        $user->saved_blog = Blog::whereIn('id',array_filter(explode(',',$user->favorite_blog)))->where('status',1)->get();               
        $user->following = User::whereIn('id',array_filter(explode(',',$user->following)))->get();
        foreach ($user->saved_event as $value) {
            $value->total_ticket = Ticket::where([['event_id',$value->id],['is_deleted',0],['status',1]])->sum('quantity');
            $value->sold_ticket = Order::where('event_id',$value->id)->sum('quantity');
            $value->available_ticket = $value->total_ticket - $value->sold_ticket;
        }
        return view('frontend.profile',compact('user'));
    }

    public function update_profile()
    {
        $user =  Auth::guard('appuser')->user();
        $languages = Language::where('status',1)->get();
        return view('frontend.user_profile',compact('user','languages'));
    }

    public function update_user_profile(Request $request)
    {
        $data = $request->all();
        $user =  Auth::guard('appuser')->user();
        $user->update($data);
        $this->setLanguage($user);
        return redirect('/');
    }

    public function setLanguage($user)
    {
        $name = $user->language;
        if (!$name)
        {
            $name = 'English';
        }
        App::setLocale($name);
        session()->put('locale', $name);
        $direction = Language::where('name',$name)->first()->direction;
        session()->put('direction', $direction);
        return true;
    }

    public function addFavorite($id,$type){  
        
        $users = AppUser::find(Auth::guard('appuser')->user()->id); 
        if($type=="event"){                   
            $likes=array_filter(explode(',',$users->favorite));      
            if(count(array_keys($likes,$id))>0){
                if (($key = array_search($id, $likes)) !== false) {
                    unset($likes[$key]);
                }
                $msg = "Remove event from Favorite!";
            }
            else{
                array_push($likes,$id);
                $msg = "Add event in Favorite!";
            }        
            $client = AppUser::find(Auth::guard('appuser')->user()->id);
            $client->favorite =implode(',',$likes);
        }
        else if($type=="blog"){           
            $likes=array_filter(explode(',',$users->favorite_blog));      
            if(count(array_keys($likes,$id))>0){
                if (($key = array_search($id, $likes)) !== false) {
                    unset($likes[$key]);
                }
                $msg = "Remove blog from Favorite!";
            }
            else{
                array_push($likes,$id);
                $msg = "Add blog in Favorite!";
            }        
            $client = AppUser::find(Auth::guard('appuser')->user()->id);
            $client->favorite_blog =implode(',',$likes);
        }
        $client->update();
        return response()->json(['msg' => $msg, 'success'=>true], 200);
    }

    public function addFollow($id){        
        $users = AppUser::find(Auth::guard('appuser')->user()->id);         
        $likes=array_filter(explode(',',$users->following));      
        if(count(array_keys($likes,$id))>0){
            if (($key = array_search($id, $likes)) !== false) {
                unset($likes[$key]);
            }
            $msg = "Remove from following list!";
        }
        else{
            array_push($likes,$id);
            $msg = "Add in following!";
        }        
        $client = AppUser::find(Auth::guard('appuser')->user()->id);
        $client->following =implode(',',$likes);
        $client->update();
        return response()->json(['msg' => $msg,'success'=>true], 200);
    }

    public function addBio(Request $request){
        $success = AppUser::find(Auth::guard('appuser')->user()->id)->update(['bio'=>$request->bio]);
        return response()->json(['data' => $request->bio,'success'=>$success], 200);
    }

    public function changePassword(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Change Password' ?? env('APP_NAME'))
        ->setDescription('This is change password page')
        ->setCanonical(url()->current())
        ->addKeyword([
            'change password page',
            $setting->app_name,
            $setting->app_name.' Change Password']);

        OpenGraph::setTitle($setting->app_name.' - Change Password' ?? env('APP_NAME'))
        ->setDescription('This is change password page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Change Password' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is change password page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
        
        SEOTools::setTitle($setting->app_name.' - Change Password' ?? env('APP_NAME'));
        SEOTools::setDescription('This is change password page');
        SEOTools::opengraph()->addProperty('keywords',[
            'change password page',
            $setting->app_name,
            $setting->app_name.' Change Password'
        ]);
        SEOTools::opengraph()->addProperty('image', $setting->imagePath . $setting->logo);
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        return view('frontend.auth.changePassword');
    }

    public function changeUserPassword(Request $request){
        $request->validate([
            'old_password' => 'bail|required',
            'password' => 'bail|required|min:6',
            'password_confirmation' => 'bail|required|same:password|min:6'
        ]);
        if (Hash::check($request->old_password, Auth::guard('appuser')->user()->password)){
            AppUser::find(Auth::guard('appuser')->user()->id)->update(['password'=>Hash::make($request->password)]);            
            return redirect('user/profile')->withStatus(__('Password is changed successfully.'));            
        }
        else{          
            return Redirect::back()->with('error_msg', 'Current Password is wrong!');
        }
    }

    public function uploadProfileImage(Request $request){
        if ($request->hasFile('image')) {            
            $imageName= (new AppHelper)->saveImage($request);
            AppUser::find(Auth::guard('appuser')->user()->id)->update(['image'=>$imageName]);
        } 

        return response()->json(['data'=>$imageName,'success'=>true], 200);

    }
    
    public function contact(){
        $setting = Setting::first(['app_name','logo']);

        SEOMeta::setTitle($setting->app_name.' - Contact Us' ?? env('APP_NAME'))
        ->setDescription('This is contact us page')
        ->setCanonical(url()->current())
        ->addKeyword([
            $setting->app_name,
            $setting->app_name.' Contact Us',
            'contact us page',
            ]);

        OpenGraph::setTitle($setting->app_name.' - Contact Us' ?? env('APP_NAME'))
        ->setDescription('This is contact us page')
        ->setUrl(url()->current());

        JsonLdMulti::setTitle($setting->app_name.' - Contact Us' ?? env('APP_NAME'));
        JsonLdMulti::setDescription('This is contact us page');
        JsonLdMulti::addImage($setting->imagePath . $setting->logo);
     
        SEOTools::setTitle($setting->app_name.' - Contact Us' ?? env('APP_NAME'));
        SEOTools::setDescription('This is contact us page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $setting->app_name.' Contact Us',
            'contact us page',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);

        return view('frontend.contact');
    }

    public function userTickets(){
        $user = Auth::guard('appuser')->user();  
        $setting = Setting::first(['app_name','logo']);
        SEOMeta::setTitle('User Tickets')
        ->setDescription('This is user tickets page')
        ->addKeyword([
            $setting->app_name,
            $user->name,
            $user->name.' '.$user->last_name,
            $user->name.' '.$user->last_name .' tickets',
         ]);

        OpenGraph::setTitle('User Tickets')
            ->setDescription('This is user tickets page')
            ->setUrl(url()->current())
            ->addImage($user->imagePath . $user->image);
         
        
        JsonLd::setTitle('User Tickets' ?? env('APP_NAME'))
        ->setDescription('This is user tickets page')
        ->addImage($user->imagePath . $user->image);

        SEOTools::setTitle('User Tickets' ?? env('APP_NAME'));
        SEOTools::setDescription('This is user tickets page');
        SEOTools::opengraph()->setUrl(url()->current());
        SEOTools::setCanonical(url()->current());
        SEOTools::opengraph()->addProperty('keywords',[
            $setting->app_name,
            $user->name,
            $user->name.' '.$user->last_name,
            $user->name.' '.$user->last_name .' tickets',
        ]);
        SEOTools::jsonLd()->addImage($setting->imagePath . $setting->logo);
        SEOTools::jsonLd()->addImage($user->imagePath . $user->image);

        $ticket['upcoming'] = Order::with(['event:id,name,image,start_time,type,end_time,address','ticket:id,ticket_number,name,price,type','organization:id,first_name,last_name,image'])
        ->where([['customer_id',Auth::guard('appuser')->user()->id],['order_status','Pending']])->orderBy('id','DESC')->get();
        $ticket['past'] = Order::with(['event:id,name,image,start_time,type,end_time,address','ticket:id,ticket_number,name,type','organization:id,first_name,last_name,image'])
        ->where([['customer_id',Auth::guard('appuser')->user()->id],['order_status','Cancel']])
        ->orWhere([['customer_id',Auth::guard('appuser')->user()->id],['order_status','Complete']])
        ->orderBy('id','DESC')->get();        
        return view('frontend.userTickets',compact('ticket'));
    }

    public function getOrder($id){
        $data = Order::with(['event:id,name,image,start_time,type,end_time,address','ticket:id,ticket_number,name,price,type','organization:id,first_name,last_name,image'])->find($id);
        $data->review=Review::where('order_id',$id)->first();
        $data->time = $data->event->start_time->format('D').', '.$data->event->start_time->format('d M Y').' at '.$data->event->start_time->format('h:i a');
        $data->start_time = $data->event->start_time->format('d M Y').', '.$data->event->start_time->format('h:i a');
        $data->end_time = $data->event->end_time->format('d M Y').', '.$data->event->end_time->format('h:i a');
        return response()->json(['data'=>$data,'success'=>true], 200);
    }

    public function makePayment($id){
        $order = Order::with(['customer'])->find($id);
        return view('frontend.createPayment', compact('order'));
    }

    public function initialize(Request $request,$id)
    {
      Rave::initialize(route('frontendCallback',$id));
    }

    public function callback(Request $request,$id)
    {       
        $payment_token = json_decode($request->resp)->tx->paymentId;
        $order = Order::find($id)->update(['payment_status'=>1,'payment_token'=> $payment_token]);
        return view('frontend.createPayment');        
    }  

    public function addReview(Request $request){
        $data = $request->all();
        $data['organization_id'] = Order::find($request->order_id)->organization_id;
        $data['event_id'] = Order::find($request->order_id)->event_id;
        $data['user_id'] = Auth::guard('appuser')->user()->id;
        $data['status'] = 0;
        Review::create($data);
        return redirect()->back();
    }
}