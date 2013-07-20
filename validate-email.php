<?php

echo json_encode(array(
    'valid' => isset($_REQUEST['code']) && $_REQUEST['code'] == 'secret',
    'message'=>'The value has to be &quot;secret&quot; (this message comes from backend)'
));