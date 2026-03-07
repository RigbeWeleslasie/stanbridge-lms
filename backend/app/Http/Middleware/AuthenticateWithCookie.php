<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthenticateWithCookie
{
    public function handle(Request $request, Closure $next)
    {
        // if no Authorization header, check cookie
        if (!$request->bearerToken() && $request->cookie('auth_token')) {
            $request->headers->set(
                'Authorization',
                'Bearer ' . $request->cookie('auth_token')
            );
        }

        return $next($request);
    }
}
