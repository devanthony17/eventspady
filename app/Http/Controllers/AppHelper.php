<?php

namespace App\Http\Controllers;

use Illuminate\Http\File;
use Illuminate\Support\Facades\Auth;

class AppHelper extends Controller
{
    public function deleteFile($fileName)
    {
        if ($fileName != "default.jpg") {
            $image_path = "images/upload/" . $fileName;
            if (unlink("images/upload/" . $fileName)) {
                return true;
            } else {
                echo "No someone reach First:)";
            }
        }
    }
    public function saveImage($request)
    {
        $image = $request->file('image');
        $name = uniqid() . '.' . $image->getClientOriginalExtension();
        $destinationPath = public_path('/images/upload');
        $image->move($destinationPath, $name);
        return $name;
    }    

    public function saveApiImage($request){
        $img = $request->image;
        $img = str_replace('data:image/png;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $img_code = base64_decode($img);
        $Iname = uniqid();
        $file = public_path('/images/upload/') . $Iname . ".png";
        $success = file_put_contents($file, $img_code);
        $image_name=$Iname . ".png";
        return $image_name;
    }

    public function saveEnv($envData)
    {
        $envFile = app()->environmentFilePath();
        if($envFile){
            $str = file_get_contents($envFile);
            if (count($envData) > 0) {
                foreach ($envData as $envKey => $envValue) {
                    $keyPosition = strpos($str, "{$envKey}=");
                    $endOfLinePosition = strpos($str, "\n", $keyPosition);
                    $oldLine = substr($str, $keyPosition, $endOfLinePosition - $keyPosition);                  
                    if (!$keyPosition || !$endOfLinePosition || !$oldLine) {
                        $str .= "{$envKey}={$envValue}\n";
                    } else {
                        $str = str_replace($oldLine, "{$envKey}={$envValue}", $str);
                    }
                }
            }
            $str = substr($str, 0, -1);
            if (!file_put_contents($envFile, $str)){ return false;  }
            else{   return true;   }            
        }        
    }    

 
}
