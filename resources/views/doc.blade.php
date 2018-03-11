@include('modal.modal')
@extends('layouts.nav')
@extends('layouts.menu')
    @section('content')
                <div class="col-sm-4" style="padding-top:80px; padding-left:300px; width: 100%; min-height: 500px;">
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <a href="{{ route('downloadfile',['file_id'=> $file_id]) }}" class="btn btn-sm btn-success"><i class="glyphicon glyphicon-send"></i>
                                    Скачать</a>
                                <a href="#" id="signButton" class="btn btn-sm btn-success">
                                    Подпись</a>
                                <a href="#myModal" onclick="clearMyModel()" class="btn btn-sm btn-success" data-toggle="modal">
                                    Отправить</a>
                                <a href="#myModalAdmin" onclick="clearMyModelAdmin()" class="btn btn-sm btn-success" data-toggle="modal">
                                    Администраторы</a>
                            </h3>
                        </div>
                        <div class="panel-body hide" id="certificate">
                            Cертификат:
                                    <select style="width: 460px;" id="cert_selector_0" class="cert_selector" onchange="getCertExpInfo(this)" defaultthumb="">
                                        </select>
                            <a href="#" class="btn btn-sm btn-success">
                                Подписать</a>
                            <span id="certExpDays"></span>
                        </div>
                        <div class="panel-body">
                            <iframe src="{{ route('browsefile',['file_id'=> $file_id]) }}" width="66%" height="500" seamless
                                    style="float: left;">
                            </iframe>
                            <div class="col-xs-6 col-sm-4" id="sidebar" role="navigation">
                        <ul class="nav text-center">
                            <li class="active">
                                <a href="#" class="list-group-item">Подписи</a>
                                <div class="row" style="min-height: 200px;"><h6 style="margin-top: 100px">Документ никем не подписан</h6></div>
                            </li>
                            <li>
                                <a href="#" class="list-group-item" data-file_id="{{$file_id}}">Доступен</a>
                                <div class="row hide accessList" id="accessList" style="min-height: 200px;"><h6 style="margin-top: 100px">Доcтупен только автору</h6></div>
                            </li>
                        </ul>
                            </div>
                        </div>

                    </div>
                </div>
    @endsection
<script>

</script>