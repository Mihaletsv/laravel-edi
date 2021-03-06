@extends('layouts.nav')
    @section('content')
        @extends('layouts.menu')
                <div class="col-sm-4" style="padding-top:80px; padding-left:300px; width: 100%;">
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h3 class="panel-title">Список файлов</h3>
                        </div>
                        <div class="panel-body">
                            @if(isset($docs))
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        @if (!empty($outbox))
                                                @include('rows.outbox_rows')
                                        @elseif (!empty($inbox))
                                                @include('rows.inbox_rows')
                                        @elseif (!empty($draft))
                                            @include('rows.draft_rows')
                                        @else
                                            @include('rows.mydocs_rows')
                                        @endif
                                </table>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
    @endsection
