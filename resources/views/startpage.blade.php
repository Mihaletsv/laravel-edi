@extends('layouts.nav')
@section('content')
        <div class="container text-center">
            <div class="jumbotron">
                <h1 class="ts30">Вас приветствует
                    <span class="ts30 sbold">DocsignEx</span>
                    - сервис для обмена документами с возможностью подписи</h1>
                <p>Здесь Вы можете хранить и подписывать свои документы и предоставлять клиентам доступ к ним.</p>
                <p>
                @auth
                {!! Form::open(['route' => 'uploadfile', 'name' => 'uploadFile', 'enctype' => 'multipart/form-data']) !!}
                    <a class="btn btn-lg btn-primary" onclick="fileUp()" role="button">Загрузить файл</a>
                    {!! Form::file('file_upload', ['class'=>'hide', 'id'=>'file_upload', 'onchange' => 'uploadFile.submit();']) !!}
                {!! Form::close() !!}
                @else
                        <div class="container">
                            <div class="row">
                                <div class="col-md-8 col-md-offset-2">
                                    <div class="panel panel-default">
                                        <div class="panel-heading">Вход</div>

                                        <div class="panel-body">
                                            <form class="form-horizontal" method="POST" action="{{ route('login') }}">
                                                {{ csrf_field() }}

                                                <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                                                    <label for="email" class="col-md-4 control-label">E-Mail Адрес</label>

                                                    <div class="col-md-6">
                                                        <input id="email" type="email" class="form-control" name="email" value=""
                                                               required="" autofocus="">
                                                    </div>
                                                </div>

                                                <div class="form-group">
                                                    <label for="password" class="col-md-4 control-label">Пароль</label>

                                                    <div class="col-md-6">
                                                        <input id="password" type="password" class="form-control" name="password"
                                                               required="">
                                                    </div>
                                                </div>

                                                <div class="form-group">
                                                    <div class="col-md-8 col-md-offset-4">
                                                        <button type="submit" class="btn btn-primary">
                                                            Войти
                                                        </button>

                                                        <a class="btn btn-link" href="http://laravel.edi.ua/password/reset">
                                                            Забыли пароль?
                                                        </a>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                                Еще не с нами? <a href="{{ route('register') }}">Зарегистрируйтесь</a>
                        </div>
                        @endauth
            </div>
        </div>
@endsection
