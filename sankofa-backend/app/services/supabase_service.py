from app.config import supabase


async def chercher_par_maladie(nom_maladie: str) -> list:
    try:
        maladie = supabase.table("maladies")\
            .select("id, nom")\
            .ilike("nom", f"%{nom_maladie}%")\
            .limit(1)\
            .execute()

        if not maladie.data:
            return []

        maladie_id = maladie.data[0]["id"]

        resultats = supabase.table("plante_maladie")\
            .select("""
                score_confiance,
                nb_temoignages,
                valide_moleculaire,
                plantes (
                    id, nom_local, noms_locaux, nom_scientifique,
                    famille, region_burkina, description,
                    mode_preparation, precautions, score_confiance
                )
            """)\
            .eq("maladie_id", maladie_id)\
            .order("score_confiance", desc=True)\
            .execute()

        return resultats.data or []

    except Exception as e:
        return []


async def chercher_par_symptomes(symptomes: list) -> list:
    if not symptomes:
        return []

    try:
        resultats = []
        for symptome in symptomes[:3]:
            maladies = supabase.table("maladies")\
                .select("id, nom, symptomes")\
                .execute()

            for maladie in maladies.data or []:
                symptomes_maladie = maladie.get("symptomes") or []
                if any(symptome.lower() in s.lower() for s in symptomes_maladie):
                    plantes = await chercher_par_maladie(maladie["nom"])
                    resultats.extend(plantes)

        seen = set()
        uniques = []
        for r in resultats:
            pid = r.get("plantes", {}).get("id")
            if pid and pid not in seen:
                seen.add(pid)
                uniques.append(r)

        return sorted(uniques, key=lambda x: x.get("score_confiance", 0), reverse=True)

    except Exception as e:
        return []


async def get_toutes_plantes() -> list:
    try:
        res = supabase.table("plantes")\
            .select("id, nom_local, noms_locaux, nom_scientifique, famille, region_burkina, description, mode_preparation, precautions, score_confiance")\
            .order("score_confiance", desc=True)\
            .execute()
        return res.data or []
    except Exception:
        return []


async def get_plante_detail(plante_id: str) -> dict | None:
    try:
        plante = supabase.table("plantes")\
            .select("*")\
            .eq("id", plante_id)\
            .single()\
            .execute()

        if not plante.data:
            return None

        molecules = supabase.table("molecules")\
            .select("id, nom, formule_chimique, mecanisme_action, proprietes, source_base")\
            .eq("plante_id", plante_id)\
            .execute()

        plante.data["molecules"] = molecules.data or []
        return plante.data

    except Exception:
        return None


async def get_toutes_maladies() -> list:
    try:
        res = supabase.table("maladies")\
            .select("id, nom, categorie, symptomes, description")\
            .order("nom")\
            .execute()
        return res.data or []
    except Exception:
        return []
