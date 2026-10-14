<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // For now, since 'auth:api' is applied before this,
        // we can just pass the request through.
        // In a real app, you might check:
        // if (!$request->user() || !$request->user()->hasRole('admin')) { abort(403); }
        
        return $next($request);
    }
}
