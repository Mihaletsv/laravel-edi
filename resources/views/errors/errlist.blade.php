@foreach($errors->all() as $err)
    <div class="alert
                    alert-danger" role="alert">{{$err}}
    </div>
@endforeach