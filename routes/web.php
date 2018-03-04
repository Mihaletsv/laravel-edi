<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
Здесь вы можете зарегистрировать веб-маршруты для своего приложения. Эти
| маршруты загружаются RouteServiceProvider.
*/


Route::get('/', function () {;
    return view('startpage');
});
Auth::routes();
Route::get('/home', 'HomeController@index')->name('home');
Route::post('/home/uploadfile','FileHandlerController@onuploadfile')->name('uploadfile');
Route::get('/home/uploadfile', function () {
    return redirect()->route('home');
});
Route::get('/home/doc/getaccess', function () {
    return redirect()->route('home');
});
Route::get('/home/doc/{fileid}','DocFileController@index')->name('displaydoc');
Route::get('/home/doc/{fileid}/browse/true','FileHandlerController@onbrowsefile')->name('browsefile');
Route::post('/home/outbox', 'UserDocController@onsenddoc')->name('senddoc');
Route::get('/home/userdocs/{type}', 'UserDocController@index')->name('userdocs');
Route::post('/home/doc/getaccess', 'UserDocController@ongetaccess')->name('getaccess');