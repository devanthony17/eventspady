<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'user_id',
        'event_id',
        'coupon_code',
        'discount',
        'start_date',
        'end_date',
        'description',
        'max_use',
        'use_count', 
        'status',      
    ];

    protected $table = 'coupon';
    public function event()
    {
        return $this->hasOne('App\Models\Event', 'id', 'event_id');
    }
    
}
