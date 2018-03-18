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
Route::get('/home/docs/{type}', 'DocController@index')->name('docs');
Route::post('/home/uploadfile','FileHandlerController@onuploadfile')->name('uploadfile');
Route::get('/home/downloadfile/{file_id}/{doc_id?}','FileHandlerController@ondownloadfile')->name('downloadfile');
Route::post('/home/doc/{doc_id}/signhelp', 'SignController@onsignverify');
Route::post('/home/doc/getadmins', 'FileController@ongetadmins')->name('getadmins');
Route::post('/home/doc/signhelp', 'SignController@onsignverify');
Route::get('/home/doc/{file_id}/{doc_id}','DocController@displaydoc')->name('displaydoc');;
Route::get('/home/doc/{file_id}/browse/true','FileHandlerController@onbrowsefile')->name('browsefile');
Route::get('/home/doc/{file_id}','FileController@displayfile')->name('displayfile');;;
Route::post('/home/senddoc/{file_id}', 'DocController@onsenddoc')->name('senddoc');
Route::post('/home/getpdf', 'DocController@ongetpdf')->name('getpdf');
Route::post('/home/signdoc', 'DocController@onsign')->name('signdoc');
Route::post('/home/doc/getaccess', 'DocController@ongetaccess')->name('getaccess');
Route::post('/home/createaccess/{file_id}', 'FileController@oncreateadmin')->name('createaccess');

