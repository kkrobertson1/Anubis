package com.ab.cemeteryapplication.Utils

import com.ab.cemeteryapplication.dto.Cemeteries
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

fun MutableList<Cemeteries>.copy(): MutableList<Cemeteries> {
    val json = Gson().toJson(this)
    return Gson().fromJson(json, object : TypeToken<MutableList<Cemeteries>>() {}.type)
}
