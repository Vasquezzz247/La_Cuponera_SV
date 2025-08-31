<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BuyOfferRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'card_number' => ['required','digits_between:13,19'],
            'exp_month'   => ['required','integer','between:1,12'],
            'exp_year'    => ['required','integer','min:' . now()->year],
            'cvc'         => ['required','digits_between:3,4'],
            'quantity'    => ['sometimes','integer','min:1','max:1'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function($v){
            // validar que exp no esté vencida (mes/año)
            $m = (int)$this->input('exp_month');
            $y = (int)$this->input('exp_year');
            $endOfMonth = now()->setYear($y)->setMonth($m)->endOfMonth();
            if ($endOfMonth->lt(now())) {
                $v->errors()->add('exp_month', 'La tarjeta está vencida.');
            }
        });
    }
}
