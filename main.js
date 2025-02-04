import './style.css';

// 팝업창을 위해
import OSM from 'ol/source/OSM';
import { Overlay} from 'ol';

import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';

// geoserver에서 WFS 방식으로 가져오기 위해
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Style } from 'ol/style';
import { Circle } from 'ol/style';
import { Stroke } from 'ol/style';
import { Fill } from 'ol/style';


// view와의 상호작용을 위해 
import { Select,DragBox,defaults } from 'ol/interaction';//드래그박스 추가
import { pointerMove,platformModifierKeyOnly, click } from 'ol/events/condition';//플랫폼수정키온리 추가
import {getWidth} from 'ol/extent';//폭 얻는 추가-어떤기능을 하는지 추가로 적을것

//////////초기 전역변수 wfs소스값을 저장하는 변수 선언
var wfsLayer;
var wfsSource;

// 테스트 환경과 실제 tomcat 서버에 올렸을 때의 url이 다르니 g_url 변수를 이용한다.
//const g_url = "http://172.20.221.167:42888";
const g_url = "http://localhost:42888";//내부서버 확인용

/**
 * CQL 필터 만들기. 모든 CQL은 이 함수를 통한다.
 */
function getCQLsearch(method) {
  let filter = "";

  if ('sido01' == method)
    filter = "address = '서울특별시 강남구 대치동'"

  else if ('sido02' == method)
    filter = "address = '서울특별시 강남구 도곡동'";

  else if ('sido03' == method)
    filter = "address = '서울특별시 강남구 삼성동'";

  else if ('sido04' == method)
    filter = "address = '서울특별시 강남구 압구정동'";

    return filter;
}

function getCQLfilter()
{
  let sCQL = "";

//   // 각 클릭할 수 있는 것들 모두 챙겨오기(여기서 지역은 제외되었음)
  const exclude01 = document.getElementById("exclude01");
  const exclude02 = document.getElementById("exclude02");
  const exclude03 = document.getElementById("exclude03");
  const exclude04 = document.getElementById("exclude04");

  // filter도 filtersearch로 변경
  //운영여부에 조건이 있으면 열기 (를 붙임.
  if ((true == exclude01.checked) || (true == exclude02.checked)|| (true ==   exclude03.checked)|| (true == exclude04.checked))
    //  if (0 < sCQL.length){
    //    sCQL += " and "

    
    sCQL += "(";//}

  if (true == exclude01.checked) {
    sCQL = sCQL + "not youngdo in ('제1종일반주거지역','제1종전용주거지역','제2종일반주거지역','제3종일반주거지역','준주거지역')"
  }

  if (true == exclude02.checked) {
    if (sCQL.charAt(sCQL.length - 1) != '(')
      sCQL += " and "
    sCQL = sCQL + "not youngdo = '일반상업지역'"
  }

  if (true == exclude03.checked) {
    if (sCQL.charAt(sCQL.length - 1) != '(')
      sCQL += " and "
    sCQL = sCQL + "not youngdo in ('일반공업지역','전용공업지역','준공업지역')"
  }

  if (true == exclude04.checked) {
    if (sCQL.charAt(sCQL.length - 1) != '(')
      sCQL += " and "
    sCQL = sCQL + "not youngdo in ('제1종일반주거지역','제1종전용주거지역','제2종일반주거지역','제3종일반주거지역','준주거지역','일반상업지역','일반공업지역','전용공업지역','준공업지역')"
  }

  // 운영여부에 조건이 있으면 닫기 )를 붙임
  if ((true == exclude01.checked) || (true == exclude02.checked)|| (true == exclude03.checked)|| (true == exclude04.checked))
    sCQL += ")";
  console.log(sCQL);
    return sCQL;
}

// geoserver에서 WFS 방식으로 자료를 받아와 openLayers에서 소스로 사용하도록 한다.

//김문식 교수님 소스코드를 사용하면 필지선택전에 cql필터가 적용되기 때문에 변경을 계속해주는 함수를 썼던 박소영 교수님 소스코드를 이용해야 한다. 김문식 교수님의 예제는 cql필터가 변경을 할 이유가 없기때문
//그 문제가 아니라 김문식 교수님은 불러오는 방법이 다른걸 암 근데 그걸 적용 시켜 할려고 해도 초기 선언을 어떻게 해야할지 모르겠다;

function WFSsearchmaker(method) {
  wfsSource = new VectorSource
    (
      {
        format: new GeoJSON(),
        url: encodeURI(g_url + "/geoserver/donghae/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=donghae:first_data" + "&outputFormat=application/json" + "&CQL_FILTER="+getCQLsearch(method))
      }
    );

  if (null != wfsLayer)
    wfsLayer.setSource(wfsSource);
};

function WFSfiltermaker() {
  wfsSource = new VectorSource
    (
      {
        format: new GeoJSON(),
        url: encodeURI(g_url + "/geoserver/donghae/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=donghae:first_data" + "&outputFormat=application/json" + "&CQL_FILTER="+getCQLfilter())
      }
    );

  if (null != wfsLayer)
    wfsLayer.setSource(wfsSource);
};



// 위에서 wfs로 받아온 벡터 소스를 openLayers의 vector layer에 올린다.
// 더 잘 보이게 스타일도 고친다.
wfsLayer = new VectorLayer
(
  {
    source: wfsSource, 
    style: new Style
    (
       {
         stroke: new Stroke
         (
           {
             color: 'rgba(255, 255, 255, 0.4)',
             width: 1
           }
         ),

         fill: new Fill
         (
           {
             color: 'rgba(145, 145, 145, 0.6)'
           }
         )
       }
    ) 
  }
);
// osm 레이어를 만든다.
const osmLayer = new TileLayer
(
  {
    source: new OSM()
  }
);

WFSfiltermaker("");//wfs함수초기화 선언하여 이 함수 선언에 따라 기본값이 전부 올라온다-
// 마우스가 WFS 필지 위로 올라갈 때(hover) 처리
const mouseHoverSelect = new Select
(
  {
    condition: pointerMove,
    style: new Style
    (
      {
        stroke: new Stroke
        (
          {
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
          }
        ),

        fill: new Fill
        (
          {
            color: 'rgba(0, 0, 255, 0.5)'
          }
        )
      }
   )
  }
);


// 마우스로 필지을 클릭하면 파랭 선으로 굵게 표시한다.
const mouseClickSelect = new Select
(
  {
    condition: click,
    style: new Style
    (
      {
        stroke: new Stroke
        (
          {
            color: 'rgba(0, 0, 255, 1.0)',
            width: 3
          }
        ),

        fill: new Fill
        (
          {
            color: 'rgba(0, 0, 255, 0.5)'
          }
        )
      }
   )
  }
);  

// WFS 점을 클릭하면 보여줄 오버레이를 만든다.

// 시험문제 5번. popup을 위한 div를 가져온다. 여기까지 다 맞으면 지도가 나타남.
// 여기가 답 자리. 이 줄을 지우고 답을 적으세요.
const landypop = document.getElementById('landyview');
const overlayLayer  = new Overlay
(
  {
    element: landypop
  }
);

const map = new Map({
  target: 'map',
  layers: [osmLayer, wfsLayer],
  view: new View({
    center: [14367375.61632484, 4509887.790027254],
    zoom: 12
  }),  
  interactions: defaults().extend([mouseHoverSelect, mouseClickSelect]),
  overlays: [overlayLayer]
});

// 지도 클릭 이벤트 처리. 만약 WFS에서 어느 한 점을 클릭했으면 오버레이(popup) 처리한다.
map.on('click', (e) =>
{
  console.log(e);

//   // 일단 창을 닫는다. 이렇게 하면 자료가 없는 곳을 찍으면 창이 닫히는 효과가 나온다.
  overlayLayer.setPosition(undefined);

//   // 점찍은 곳의 자료를 찾아낸다. geoserver에서는 WFS를 위해 위치 정보 뿐 아니라 메타데이터도 같이 보내고 있다.
  map.forEachFeatureAtPixel(e.pixel, (feature, layer) =>
  {
//     // 이 point와 같이 넘어온 메타데이터 값을 찾는다.
    
    let id = feature.get('id');
    let pnu = feature.get('pnu');
    let address = feature.get('address');
    let jibun = feature.get('jibun');
    let area = feature.get('area');
    let youngdo = feature.get('youngdo');
    let price = feature.get('price');

//     // 오버레이를 위한 div에 값들을 적는다.
    
//     // 여기가 답 자리. 이 줄을 지우고 답을 적으세요.
    document.getElementById("jspurl").href = "info.jsp?cvsid="+id;
    document.getElementById("cvs_id").innerHTML = address;
    document.getElementById("cvs_name").innerHTML = jibun;
    document.getElementById("cvs_addr_doro").innerHTML = area;
    document.getElementById("cvs_addr_jibun").innerHTML = youngdo;
    document.getElementById("cvs_tel").innerHTML = price;

    // document.getElementById("pun_window").innerHTML = pnu;
    // document.getElementById("address_window").innerHTML = address;
    // document.getElementById("jibun_window").innerHTML = jibun;
    // document.getElementById("area_window").innerHTML = area;
    // document.getElementById("youngdo_window").innerHTML = youngdo;
    // document.getElementById("price_window").innerHTML = price;

//     // 오버레이 창을 띄운다.
    overlayLayer.setPosition(e.coordinate);

  })
  
}
);

// map.on('click', (e) =>
//   {
//     console.log(e);
  
//     overlayLayer.setPosition(undefined);

//     map.forEachFeatureAtPixel(e.pixel, (feature, layer) =>
//     {
//   //     // 이 point와 같이 넘어온 메타데이터 값을 찾는다.
//       //팝업창말고 윈도우 창에서 나타내기 위한
//       let pnu_window = feature.get('pnu');
//       let address_window = feature.get('address');
//       let jibun_window = feature.get('jibun');
//       let area_window = feature.get('area');
//       let youngdo_window = feature.get('youngdo');
//       let price_window = feature.get('price');
//   //     // 오버레이를 위한 div에 값들을 적는다.
      
//   //     // 여기가 답 자리. 이 줄을 지우고 답을 적으세요.
//     document.getElementById("pun_window").innerHTML = pnu_window;
//     document.getElementById("address_window").innerHTML = address_window;
//     document.getElementById("jibun_window").innerHTML = jibun_window;
//     document.getElementById("area_window").innerHTML = area_window;
//     document.getElementById("youngdo_window").innerHTML = youngdo_window;
//     document.getElementById("price_window").innerHTML = price_window;
      
      
  
//     })
    
//   }
//   );
    
const selectedStyle = new Style({//마우스 드래그로 선택하면 나타나는 안색상과 겉에선
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

// a normal select interaction to handle click
const select = new Select({
  style: function (feature) {
    const color = feature.get('COLOR_BIO') || '#eeeeee';
    selectedStyle.getFill().setColor(color);
    return selectedStyle;
  },
});
map.addInteraction(select);

const selectedFeatures = select.getFeatures();

// a DragBox interaction used to select features by drawing boxes
const dragBox = new DragBox({
  condition: platformModifierKeyOnly,
});

map.addInteraction(dragBox);

dragBox.on('boxend', function () {
  const boxExtent = dragBox.getGeometry().getExtent();

  // if the extent crosses the antimeridian process each world separately
  const worldExtent = map.getView().getProjection().getExtent();
  const worldWidth = getWidth(worldExtent);
  const startWorld = Math.floor((boxExtent[0] - worldExtent[0]) / worldWidth);
  const endWorld = Math.floor((boxExtent[2] - worldExtent[0]) / worldWidth);

  for (let world = startWorld; world <= endWorld; ++world) {
    const left = Math.max(boxExtent[0] - world * worldWidth, worldExtent[0]);
    const right = Math.min(boxExtent[2] - world * worldWidth, worldExtent[2]);
    const extent = [left, boxExtent[1], right, boxExtent[3]];

    const boxFeatures = wfsSource
      .getFeaturesInExtent(extent)
      .filter(
        (feature) =>
          !selectedFeatures.getArray().includes(feature) &&
          feature.getGeometry().intersectsExtent(extent),
      );

    // features that intersect the box geometry are added to the
    // collection of selected features

    // if the view is not obliquely rotated the box geometry and
    // its extent are equalivalent so intersecting features can
    // be added directly to the collection
    const rotation = map.getView().getRotation();
    const oblique = rotation % (Math.PI / 2) !== 0;

    // when the view is obliquely rotated the box extent will
    // exceed its geometry so both the box and the candidate
    // feature geometries are rotated around a common anchor
    // to confirm that, with the box geometry aligned with its
    // extent, the geometries intersect
    if (oblique) {
      const anchor = [0, 0];
      const geometry = dragBox.getGeometry().clone();
      geometry.translate(-world * worldWidth, 0);
      geometry.rotate(-rotation, anchor);
      const extent = geometry.getExtent();
      boxFeatures.forEach(function (feature) {
        const geometry = feature.getGeometry().clone();
        geometry.rotate(-rotation, anchor);
        if (geometry.intersectsExtent(extent)) {
          selectedFeatures.push(feature);
        }
      });
    } else {
      selectedFeatures.extend(boxFeatures);
    }
  }
});

// clear selection when drawing a new box and when clicking on the map
dragBox.on('boxstart', function () {
  selectedFeatures.clear();
});

const infoBox = document.getElementById('info');

selectedFeatures.on(['add', 'remove'], function () {
  const names = selectedFeatures.getArray().map((feature) => {
    return feature.get('address');
  });
  if (names.length > 0) {
    infoBox.innerHTML = names.join(', ');
  } else {
    infoBox.innerHTML = 'None';
  }
});

document.getElementById('sido01').onclick = () => {
  console.log('dong01 clicked');
  WFSsearchmaker('sido01');
}

document.getElementById('sido02').onclick = () => {
  console.log('dong02 clicked');
  WFSsearchmaker('sido02');
}

document.getElementById('exclude01').onchange = () => {
  console.log('exclude01 clicked');
  WFSfiltermaker();
}

document.getElementById('exclude02').onchange = () => {
  console.log('exclude02 clicked');
  WFSfiltermaker();
}

document.getElementById('exclude03').onchange = () => {
  console.log('exclude03 clicked');
  WFSfiltermaker();
}

document.getElementById('exclude04').onchange = () => {
  console.log('exclude04 clicked');
  WFSfiltermaker();
}