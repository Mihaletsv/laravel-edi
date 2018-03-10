@include('modal.modalrow')
<div id="myModal" class="modal fade ">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">Выбор контрагентов для отправки</h4>
            </div>
            <div class="modal-body">
                {!! Form::open(['route' => ['senddoc', 'file_id'=>$file_id], 'name' => 'recForm']) !!}
                {!! Form::hidden('file_id', "{$file_id}", ['class'=>'hide', 'id'=>'file_id']) !!}
                <div class="row">
                    <div class="col-xs-12"  id="recDivRows">
                        <div class="input-group">
                            {!! Form::text('recipient[0]', null, ['class'=>'form-control addrec', 'id'=>'recipient0', 'data-key' => '0']) !!}
                            <span class="input-group-btn">
                                <button class="btn btn-default" type="button" disabled="disabled">Убрать</button>
                                </span>

                        </div>
                    </div>
                </div>
                {!! Form::close() !!}
            </div>
            <div class="modal-footer">
                <button class="btn btn-default btnaddrec" type="button">Добавить строку</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>
                <button type="button" onclick="recForm.submit()" class="btn btn-primary">Отправить</button>
            </div>
        </div>
    </div>
</div>


<div id="myModalAdmin" class="modal fade ">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">Назначить контрагента админом:</h4>
            </div>
            <div class="modal-body">
                {!! Form::open(['route' => ['createaccess', 'file_id'=>$file_id], 'name' => 'recFormAdmin']) !!}
                {!! Form::hidden('file_id', "{$file_id}", ['class'=>'hide', 'id'=>'file_id']) !!}
                <div class="row">
                    <div class="col-xs-12"  id="recAdminDivRows">
                    </div>
                </div>
                {!! Form::close() !!}
            </div>
            <div class="modal-footer">
                <button class="btn btn-default btnaddrecAdmin" type="button">Добавить строку</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>
                <button type="button" onclick="recFormAdmin.submit()" class="btn btn-primary">Отправить</button>
            </div>
        </div>
    </div>
</div>