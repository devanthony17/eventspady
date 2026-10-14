<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        if (request()->expectsJson() || request()->is('api/*')) {
            $blog = Blog::with(['category'])->where('status',1)->orderBy('id','DESC')->get();
            $blogArray = $blog->map(function($item) {
                $arr = $item->toArray();
                $arr['id'] = (string)$arr['id'];
                if (isset($arr['category'])) $arr['category']['id'] = (string)$arr['category']['id'];
                return $arr;
            });
            return response()->json(['success' => true, 'data' => $blogArray]);
        }
        abort_if(Gate::denies('blog_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $blog = Blog::with(['category'])->orderBy('id','DESC')->get();
        return view('admin.blog.index', compact('blog'));

    }

    public function create()
    {
        abort_if(Gate::denies('banner_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $category = Category::where('status',1)->orderBy('id','DESC')->get();
        return view('admin.blog.create', compact('category'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'bai l|required',
            'description' => 'bail|required',
            'category_id' => 'bail|required',
            'image' => 'bail|required',
        ]);
        $data = $request->all();
        if ($request->hasFile('image')) {
            $data['image'] = (new AppHelper)->saveImage($request);
        }
        $blog = Blog::create($data);
        return redirect()->route('blog.index')->withStatus(__('Blog is added successfully.'));
    }

    public function show(Blog $blog)
    {

    }

    public function edit(Blog $blog)
    {
        abort_if(Gate::denies('banner_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');
        $category = Category::where('status',1)->orderBy('id','DESC')->get();
        return view('admin.blog.edit',compact('blog','category'));
    }

    public function update(Request $request, Blog $blog)
    {
        $request->validate([
            'title' => 'bai l|required',
            'description' => 'bail|required',
            'category_id' => 'bail|required',
        ]);
        $data = $request->all();
        if ($request->hasFile('image')){
            (new AppHelper)->deleteFile($blog->image);
            $data['image'] = (new AppHelper)->saveImage($request);
        }
        $blog = Blog::find($blog->id)->update($data);
        return redirect()->route('blog.index')->withStatus(__('Blog is updated successfully.'));
    }

    public function destroy(Blog $blog)
    {
        try{
            (new AppHelper)->deleteFile($blog->image);
            $blog->delete();
            return true;
        }catch(Throwable $th){
            return response('Data is Connected with other Data', 400);
        }
    }
}
