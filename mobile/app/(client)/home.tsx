import { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCategories, getHome, getRequests } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Badge, Button, Card, Empty, Screen, Title } from '@/components/ui';
import { RequestCard } from '@/components/RequestCard';
import type { Category, HomeData, ServiceRequest } from '@/types/api';

const categoryImages:Record<string,any>={
  'Plomería':require('../../assets/services/plomeria.png'),
  'Electricidad':require('../../assets/services/electricidad.png'),
  'Carpintería':require('../../assets/services/carpinteria.png'),
  'Pintura':require('../../assets/services/pintura.png'),
  'Jardinería':require('../../assets/services/jardineria.png'),
  'Albañilería':require('../../assets/services/albanileria.png'),
  'Electrodomésticos':require('../../assets/services/electrodomesticos.png'),
  'Mantenimiento General':require('../../assets/services/mantenimiento.png'),
};

export default function Home(){
  const{user}=useAuth();
  const{palette}=useTheme();
  const{width}=useWindowDimensions();
  const[all,setAll]=useState<ServiceRequest[]>([]);
  const[categories,setCategories]=useState<Category[]>([]);
  const[home,setHome]=useState<HomeData|null>(null);
  const[q,setQ]=useState('');

  useEffect(()=>{
    Promise.allSettled([getRequests(),getCategories(),getHome()]).then(results=>{
      if(results[0].status==='fulfilled')setAll(results[0].value);
      if(results[1].status==='fulfilled')setCategories(results[1].value);
      if(results[2].status==='fulfilled')setHome(results[2].value);
    });
  },[]);

  const active=all.filter(x=>!['completado','cancelado'].includes(x.estado)).length;
  const completed=all.filter(x=>x.estado==='completado').length;
  const items=all.slice(0,3);
  const featured=home?.featured_professionals?.slice(0,6)??[];
  const categoryWidth=Math.min(Math.max(width*.66,230),330);
  const professionalWidth=Math.min(Math.max(width*.72,255),340);
  const firstName=useMemo(()=>user?.nombre?.split(' ')[0]||'Cliente',[user?.nombre]);

  function search(value=q){
    const clean=value.trim();
    router.push(clean?`/(client)/search?q=${encodeURIComponent(clean)}`:'/(client)/search');
  }

  return <Screen>
    <View style={{gap:4}}>
      <Text style={{color:palette.muted,fontWeight:'700'}}>Hola, {firstName}</Text>
      <Title subtitle="Encuentra profesionales verificados, compara experiencia y solicita el servicio desde un solo lugar.">¿Qué necesitas hoy?</Title>
    </View>

    <Card>
      <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
        <View style={{flex:1,minHeight:50,borderWidth:1,borderColor:palette.border,borderRadius:14,backgroundColor:palette.background,flexDirection:'row',alignItems:'center',paddingHorizontal:13,gap:9}}>
          <Ionicons name="search-outline" size={21} color={palette.primary}/>
          <TextInput
            value={q}
            onChangeText={setQ}
            onSubmitEditing={()=>search()}
            placeholder="Buscar por profesión, servicio o ciudad…"
            placeholderTextColor={palette.muted}
            style={{flex:1,color:palette.text,fontSize:15,paddingVertical:12}}
            returnKeyType="search"
          />
        </View>
        <Pressable onPress={()=>search()} style={{width:50,height:50,borderRadius:14,backgroundColor:palette.primary,alignItems:'center',justifyContent:'center'}}>
          <Ionicons name="arrow-forward" size={22} color={palette.primaryText}/>
        </Pressable>
      </View>
      <View style={{flexDirection:'row',gap:10}}>
        <View style={{flex:1}}><Button title="Nueva solicitud" icon="add-circle-outline" onPress={()=>router.push('/request/new')}/></View>
        <View style={{flex:1}}><Button title="Mis solicitudes" variant="secondary" icon="clipboard-outline" onPress={()=>router.push('/(client)/requests')}/></View>
      </View>
    </Card>

    <View style={{gap:10}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={{color:palette.text,fontWeight:'900',fontSize:20}}>Explora por categoría</Text>
        <Pressable onPress={()=>router.push('/(client)/search')}><Text style={{color:palette.primary,fontWeight:'800'}}>Ver todas</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingRight:8}}>
        {categories.map(category=><Pressable key={category.slug} onPress={()=>router.push(`/(client)/search?q=${encodeURIComponent(category.name)}`)} style={{width:categoryWidth,height:155,borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:palette.border,backgroundColor:palette.surface}}>
          {categoryImages[category.name]?<ImageBackground source={categoryImages[category.name]} resizeMode="cover" style={{flex:1,justifyContent:'flex-end'}} imageStyle={{opacity:.62}}>
            <View style={{padding:15,backgroundColor:'rgba(0,0,0,.5)',gap:3}}>
              <Text style={{color:'#fff',fontSize:20,fontWeight:'900'}}>{category.name}</Text>
              <Text style={{color:'#e8eef5',fontSize:13}} numberOfLines={2}>{category.description||`Encuentra profesionales en ${category.name}`}</Text>
            </View>
          </ImageBackground>:<View style={{flex:1,padding:15,justifyContent:'flex-end'}}><Text style={{color:palette.text,fontSize:20,fontWeight:'900'}}>{category.name}</Text><Text style={{color:palette.muted}}>{category.description}</Text></View>}
        </Pressable>)}
      </ScrollView>
    </View>

    {featured.length?<View style={{gap:10}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={{color:palette.text,fontWeight:'900',fontSize:20}}>Profesionales destacados</Text>
        <Pressable onPress={()=>router.push('/(client)/search')}><Text style={{color:palette.primary,fontWeight:'800'}}>Explorar</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingRight:8}}>
        {featured.map(worker=><Pressable key={worker.id} onPress={()=>router.push(`/professional/${worker.id}`)} style={{width:professionalWidth,borderWidth:1,borderColor:palette.border,borderRadius:18,backgroundColor:palette.surface,padding:16,gap:10}}>
          <View style={{flexDirection:'row',gap:12,alignItems:'center'}}>
            <Avatar uri={worker.foto_url} name={worker.nombre} size={58}/>
            <View style={{flex:1,gap:3}}>
              <Text style={{color:palette.text,fontWeight:'900',fontSize:17}} numberOfLines={1}>{worker.nombre}</Text>
              <Text style={{color:palette.primary,fontWeight:'700'}} numberOfLines={1}>{worker.especialidad||'Profesional NAXVO'}</Text>
              <Text style={{color:palette.muted,fontSize:13}} numberOfLines={1}>{[worker.ciudad,worker.estado].filter(Boolean).join(', ')||'Servicio a domicilio'}</Text>
            </View>
            {worker.verificado?<Ionicons name="shield-checkmark" size={23} color={palette.success}/>:null}
          </View>
          <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
            <Badge text={`★ ${Number(worker.calificacion||0).toFixed(1)}`} tone="warning"/>
            <Badge text={`${worker.servicios||0} servicios`} tone="info"/>
            {worker.disponible?<Badge text="Disponible" tone="success"/>:null}
          </View>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{color:palette.muted,fontSize:13}}>Ver perfil y trabajos</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.primary}/>
          </View>
        </Pressable>)}
      </ScrollView>
    </View>:null}

    <Card>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10}}>
        <Text style={{color:palette.text,fontWeight:'900',fontSize:19}}>Tu actividad</Text>
        <Pressable onPress={()=>router.push('/(client)/requests')}><Text style={{color:palette.primary,fontWeight:'800'}}>Historial</Text></Pressable>
      </View>
      <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
        <Badge text={`${all.length} solicitudes`} tone="info"/>
        <Badge text={`${active} activas`} tone={active?'warning':'success'}/>
        <Badge text={`${completed} completadas`} tone="success"/>
      </View>
    </Card>

    <Text style={{color:palette.text,fontWeight:'900',fontSize:20}}>Solicitudes recientes</Text>
    {items.length?items.map(x=><RequestCard key={x.id} item={x} onPress={()=>router.push(`/request/${x.id}`)}/>):<Empty title="Aún no tienes solicitudes" text="Busca un profesional o publica una solicitud abierta."/>}
  </Screen>;
}
