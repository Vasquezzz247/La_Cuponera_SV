<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    // Resumen por empresa
    public function byCompany()
    {
        // empresas = users con rol business
        // join offers -> coupons
        $rows = DB::table('users as u')
            ->join('offers as o', 'o.user_id', '=', 'u.id')
            ->join('coupons as c', 'c.offer_id', '=', 'o.id')
            ->selectRaw('
                u.id as business_id,
                u.name as business_name,
                COALESCE(COUNT(c.id),0) as coupons_sold,
                COALESCE(SUM(c.unit_price),0) as gross_sales,
                COALESCE(SUM(c.platform_fee_amount),0) as platform_gain,
                COALESCE(SUM(c.business_amount),0) as business_gain
            ')
            ->groupBy('u.id','u.name')
            ->orderBy('business_name')
            ->get();

        return response()->json($rows);
    }

    // Detalle para una empresa específica
    public function companyDetail(User $user)
    {
        // seguridad básica: debe ser business
        if (!$user->hasRole('business')) {
            return response()->json(['message' => 'No es empresa'], 422);
        }

        $summary = DB::table('offers as o')
            ->leftJoin('coupons as c', 'c.offer_id', '=', 'o.id')
            ->where('o.user_id', $user->id)
            ->selectRaw('
                COUNT(c.id) as coupons_sold,
                COALESCE(SUM(c.unit_price),0) as gross_sales,
                COALESCE(SUM(c.platform_fee_amount),0) as platform_gain,
                COALESCE(SUM(c.business_amount),0) as business_gain
            ')
            ->first();

        // (opcional) breakdown por oferta
        $byOffer = DB::table('offers as o')
            ->leftJoin('coupons as c', 'c.offer_id', '=', 'o.id')
            ->where('o.user_id', $user->id)
            ->groupBy('o.id','o.title')
            ->selectRaw('
                o.id, o.title,
                COUNT(c.id) as coupons_sold,
                COALESCE(SUM(c.unit_price),0) as gross_sales,
                COALESCE(SUM(c.platform_fee_amount),0) as platform_gain,
                COALESCE(SUM(c.business_amount),0) as business_gain
            ')
            ->get();

        return response()->json([
            'business' => ['id' => $user->id, 'name' => $user->name],
            'summary'  => $summary,
            'offers'   => $byOffer,
        ]);
    }
}
