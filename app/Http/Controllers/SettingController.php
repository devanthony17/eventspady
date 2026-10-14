<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Setting;
use App\Models\Timezone;
use App\Http\Controllers\AppHelper;
use App\Models\Language;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use App;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::find(1);
        $currencies = Currency::get();
        $timezone = Timezone::get();
        $payment = PaymentSetting::find(1);
        $languages = Language::whereStatus(1)->get();
        return view('admin.setting', compact('setting','languages','currencies','payment','timezone'));
    }

    public function create()
    {

    }

    public function store(Request $request)
    {
        $data = $request->all();
        
        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $name = uniqid() . '.' . $logo->getClientOriginalExtension();
            $destinationPath = public_path('/images/upload');
            $logo->move($destinationPath, $name);
            $data['logo'] = $name;
        } 
        if ($request->hasFile('favicon')) {
            $favicon = $request->file('favicon');
            $faviconName = uniqid() . '.' . $favicon->getClientOriginalExtension();
            $faviconPath = public_path('/images/upload');
            $favicon->move($faviconPath, $faviconName);
            $data['favicon'] = $faviconName;
        }     
        Setting::find(1)->update($data);
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function show(Setting $setting)
    {

    }

    public function edit(Setting $setting)
    {

    }

    public function update(Request $request, Setting $setting)
    {

    }

    public function destroy(Setting $setting)
    {

    }

    public function saveMailSetting(Request $request){
        $request->validate([
            'mail_host' => 'bail|required_if:mail_notification,1',
            'mail_port' => 'bail|required_if:mail_notification,1',
            'mail_username' => 'bail|required_if:mail_notification,1',
            'mail_password' => 'bail|required_if:mail_notification,1',
            'sender_email' => 'bail|required_if:mail_notification,1',
        ]);
        $data = $request->all();
        if(!isset($request->mail_notification)){
            $data['mail_notification'] = 0;
        }         
        Setting::find(1)->update($data);
        $envData = [
            'MAIL_HOST'=> $request->mail_host,
            'MAIL_PORT'=> $request->mail_port,
            'MAIL_USERNAME'=> $request->mail_username,
            'MAIL_PASSWORD'=> $request->mail_password,
            'MAIL_FROM_ADDRESS'=> $request->sender_email,
        ];

        (new AppHelper)->saveEnv($envData);
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function saveVerificationSetting(Request $request){
        $request->validate([
            'verify_by' => 'bail|required_if:user_verify,1',           
        ]);
        $data = $request->all();
        if(!isset($request->user_verify)){
            $data['user_verify'] = 0;
        }              
        Setting::find(1)->update($data);
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function saveOrganizationSetting(Request $request){
        $request->validate([
            'terms_use_organizer' => 'bail|required',
            'privacy_policy_organizer' => 'bail|required',            
        ]);        
        Setting::find(1)->update($request->all());
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function saveOnesignalSetting(Request $request){
        $request->validate([
            'onesignal_app_id' => 'bail|required_if:push_notification,1',
            'onesignal_project_number' => 'bail|required_if:push_notification,1',
            'onesignal_api_key' => 'bail|required_if:push_notification,1',
            'onesignal_auth_key' => 'bail|required_if:push_notification,1', 
            'or_onesignal_app_id' => 'bail|required_if:push_notification,1',
            'or_onesignal_project_number' => 'bail|required_if:push_notification,1',
            'or_onesignal_api_key' => 'bail|required_if:push_notification,1',
            'or_onesignal_auth_key' => 'bail|required_if:push_notification,1',            
        ]);
        $data = $request->all();
        if(!isset($request->push_notification)){
            $data['push_notification'] = 0;
        } 
        Setting::find(1)->update($data);
        $envData = [
            'APP_ID'=> $request->onesignal_app_id,
            'REST_API_KEY'=> $request->onesignal_api_key,
            'USER_AUTH_KEY'=> $request->onesignal_auth_key,
            'ORG_APP_ID'=> $request->or_onesignal_app_id,
            'ORG_REST_API_KEY'=> $request->or_onesignal_api_key,
            'ORG_USER_AUTH_KEY'=> $request->or_onesignal_auth_key,
        ];

        (new AppHelper)->saveEnv($envData);

        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }


    public function saveSmsSetting(Request $request){
        $request->validate([
            'twilio_account_id' => 'bail|required_if:sms_notification,1',
            'twilio_auth_token' => 'bail|required_if:sms_notification,1',
            'twilio_phone_number' => 'bail|required_if:sms_notification,1',                        
        ]);
        $data = $request->all();
        if(!isset($request->sms_notification)){
            $data['sms_notification'] = 0;
        } 
        Setting::find(1)->update($data);
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function additionalSetting(Request $request){
        Setting::find(1)->update($request->all());
        $this->setLanguage();
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function setLanguage()
    {
        $name = Setting::first()->language;
        if (!$name)
        {
            $name = 'english';
        }
        App::setLocale($name);
        session()->put('locale', $name);
        $direction = Language::where('name',$name)->first()->direction;
        session()->put('direction', $direction);
        return true;
    }

    public function supportSetting(Request $request){
        Setting::find(1)->update($request->all());
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }

    public function savePaymentSetting(Request $request){
        $request->validate([
            'stripeSecretKey' => 'bail|required_if:stripe,1',
            'stripePublicKey' => 'bail|required_if:stripe,1', 
            'paypalClientId' => 'bail|required_if:paypal,1',   
            'paypalSecret' => 'bail|required_if:paypal,1',   
            'razorPublishKey' => 'bail|required_if:razor,1',   
            'razorSecretKey' => 'bail|required_if:razor,1',   
            'ravePublicKey' => 'bail|required_if:flutterwave,1',   
            'raveSecretKey' => 'bail|required_if:flutterwave,1',   
        ]);
        $data = $request->all();
        if(!isset($request->stripe)){ $data['stripe'] = 0; }
        if(!isset($request->paypal)){ $data['paypal'] = 0; }
        if(!isset($request->razor)){ $data['razor'] = 0; }
        if(!isset($request->flutterwave)){ $data['flutterwave'] = 0; }
        if(!isset($request->cod)){  $data['cod'] = 0;   } 
        PaymentSetting::find(1)->update($data);

        $envData = [
            'RAVE_PUBLIC_KEY'=> $request->ravePublicKey,
            'RAVE_SECRET_KEY'=> $request->raveSecretKey,
        ];

        (new AppHelper)->saveEnv($envData);
        return redirect('admin-setting')->withStatus(__('Setting saved successfully.'));
    }
}