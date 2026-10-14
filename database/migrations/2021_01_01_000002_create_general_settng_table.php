<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGeneralSettngTable extends Migration
{
    public function up()
    {
        Schema::create('general_settng', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->nullable();
            $table->string('email')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('map_key')->nullable();
            $table->string('currency')->default('USD');
            $table->string('timezone')->nullable();
            $table->string('footer_copyright')->nullable();
            $table->tinyInteger('user_verify')->default(0);
            $table->string('verify_by')->nullable();
            $table->string('default_lat')->nullable();
            $table->string('default_long')->nullable();
            $table->tinyInteger('push_notification')->default(0);
            $table->string('onesignal_app_id')->nullable();
            $table->string('onesignal_project_number')->nullable();
            $table->string('onesignal_api_key')->nullable();
            $table->string('onesignal_auth_key')->nullable();
            $table->string('or_onesignal_app_id')->nullable();
            $table->string('or_onesignal_project_number')->nullable();
            $table->string('or_onesignal_api_key')->nullable();
            $table->string('or_onesignal_auth_key')->nullable();
            $table->tinyInteger('mail_notification')->default(0);
            $table->string('mail_host')->nullable();
            $table->string('mail_port')->nullable();
            $table->string('mail_username')->nullable();
            $table->string('mail_password')->nullable();
            $table->string('sender_email')->nullable();
            $table->tinyInteger('sms_notification')->default(0);
            $table->string('twilio_account_id')->nullable();
            $table->string('twilio_auth_token')->nullable();
            $table->string('twilio_phone_number')->nullable();
            $table->longText('help_center')->nullable();
            $table->longText('privacy_policy')->nullable();
            $table->longText('cookie_policy')->nullable();
            $table->longText('terms_services')->nullable();
            $table->longText('acknowledgement')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('app_version')->nullable();
            $table->longText('privacy_policy_organizer')->nullable();
            $table->longText('terms_use_organizer')->nullable();
            $table->string('license_key')->nullable();
            $table->string('license_name')->nullable();
            $table->tinyInteger('license_status')->default(0);
            $table->string('org_commission_type')->nullable();
            $table->string('org_commission')->nullable();
            $table->string('language')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('general_settng');
    }
}
