<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class AppUser extends Authenticatable
{
    use HasFactory,Notifiable,HasApiTokens;
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'image',
        'address',
        'status',
        'following',
        'provider',
        'favorite',
        'favorite_blog',
        'phone',
        'lat','lang',
        'bio',
        'provider_token',
        'device_token','language', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $table = 'app_user';
    protected $appends = ['imagePath'];

    public function getImagePathAttribute()
    {
        return url('images/upload') . '/';
    }
}
