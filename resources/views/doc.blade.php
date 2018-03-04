<div id="rec_template" style="display: none;">
    <div class="input-group">
        <input type="text" id="recipient%key%"  name="recipient[%key%]"  data-key="%key%" class="form-control addrec" value="">
        <span class="input-group-btn">
                                <button class="btn btn-default" onclick="deleteRecRow(this)" type="button">Убрать</button>
                                </span>
    </div>
</div>

<div id="myModal" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <!-- Заголовок модального окна -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">Выбор контрагентов для отправки</h4>
            </div>
            <!-- Основное содержимое модального окна -->
            <div class="modal-body">
                <form name="recForm" class="form-horizontal" method="POST" action="{{ route('senddoc') }}">
                    <input type="hidden" id="fileid"  name="fileid" value="{{$fileid}}">
                    {{ csrf_field() }}
                    <div class="row">
                        <div class="col-xs-12"  id="recDivRows">
                            <div class="input-group">
                                <input type="text" id="recipient0"  name="recipient[0]" data-key="0" class="form-control addrec" value="">
                                <span class="input-group-btn">
                                <button class="btn btn-default" type="button" disabled="disabled">Убрать</button>
                                </span>

                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-default btnaddrec" type="button" id="btnAddRec">Добавить строку</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>
                <button type="button" onclick="recForm.submit()" class="btn btn-primary">Отправить</button>
            </div>
        </div>
    </div>
</div>
@extends('layouts.nav')
@extends('layouts.menu')
    @section('content')
                <div class="col-sm-4" style="padding-top:80px; padding-left:300px; width: 100%; min-height: 500px;">
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <a href="#myModal" onclick="clearMyModel()" class="btn btn-sm btn-success" data-toggle="modal">Отправить</a></h3>
                        </div>
                        <div class="panel-body">
                            <iframe src="{{ route('browsefile',['fileid'=> $fileid]) }}" width="66%" height="500" seamless style="float: left;">
                            </iframe>
                            <div class="col-xs-6 col-sm-4" id="sidebar" role="navigation">
                        <ul class="nav text-center">
                            <li class="active">
                                <a href="#" class="list-group-item">Подписи</a>
                                <div class="row" style="min-height: 200px;"><h6 style="margin-top: 100px">Документ никем не подписан</h6></div>
                            </li>
                            <li>
                                <a href="#" class="list-group-item" data-fileid="{{$fileid}}">Доступен</a>
                                <div class="row hide" style="min-height: 200px;"><h6 style="margin-top: 100px">Доcтупен только автору</h6></div>
                            </li>
                        </ul>
                            </div>
                        </div>

                    </div>
                </div>
    @endsection
<script src="../../js/app.js">

</script>