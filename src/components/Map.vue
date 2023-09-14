<template>
  <yandex-map class="map" ref="map" :zoom="zoom" :coords="coords" :controls="controls">
  </yandex-map>
</template>

<script>
import { loadYmap } from 'vue-yandex-maps'
import location from '@/data/location.json'
import temperatures from '@/data/temperatures.json'
import locomotive from '@/assets/images/locomotive.svg'
import mapsmark from '@/assets/images/mapsmark.svg'

export default {
  name: 'Map',
  data() {
    return {
      points: null,
      locoType: null,
      locoNumber: null,
      outsideTemps: null,
      tempTimestamps: null,
      coords: [59.132296, 37.84513],
      controls: [],
      zoom: 15
    }
  },

  created() {
    const {
      Latitude: latitudes,
      Longitude: longitudes,
      Timestamp: locTimestamp,
      LocoType: locoType,
      LocoNumber: locoNumber
    } = location
    const { OutsideTemp: outsideTemps, Timestamp: tempTimestamps } = temperatures

    this.locoType = locoType
    this.locoNumber = locoNumber
    this.outsideTemps = outsideTemps
    this.tempTimestamps = tempTimestamps

    this.points = latitudes.map((latitude, index) => {
      const diffTimestamp = this.getDiffTimestamp(locTimestamp[index])

      return {
        coordinates: [latitude, longitudes[index]],
        temperature: this.getLocationTemp(diffTimestamp)
      }
    })
  },

  async mounted() {
    // получаем весь функционал ymaps
    await loadYmap()

    // извлекаем массив координат всех точек
    const pointsCoordinates = this.points.map((point) => point.coordinates)

    // cоздаём ломаную линию
    const polyline = new ymaps.Polyline(pointsCoordinates, null, {
      draggable: false,
      strokeColor: '#ff0000',
      strokeWidth: 3
    })

    // cоздаём описанние локомотива
    const descriptionLoco = new ymaps.control.Button({
      data: {
        content: `тип: ${this.locoType} | номер: ${this.locoNumber}`,
        image: locomotive
      },
      options: {
        maxWidth: 250,
        selectOnClick: false
      }
    })

    // cоздаём коллекцию меток
    const placemarkCollection = new ymaps.GeoObjectCollection()

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const placemark = new ymaps.Placemark(
        point.coordinates,
        {
          hintContent: `температура: ${point.temperature}℃`
        },
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: '',
          iconImageSize: [30, 42],
          iconImageOffset: [-15, -38]
        }
      )

      // добавляем метку в коллекцию
      placemarkCollection.add(placemark)
    }

    // добавляем/удаляем метку по ховеру
    placemarkCollection.events
      .add('mouseenter', function (e) {
        e.get('target').options.set('iconImageHref', mapsmark)
      })
      .add('mouseleave', function (e) {
        e.get('target').options.set('iconImageHref', '')
      })

    // добавляем ломаную линию на карту
    this.$refs.map.myMap?.geoObjects.add(polyline)

    // добавляем описанние локомотива на карту
    this.$refs.map.myMap?.controls.add(descriptionLoco, {
      floatIndex: 0
    })

    // добавляем коллекцию на карту
    this.$refs.map.myMap?.geoObjects.add(placemarkCollection)
  },

  methods: {
    getDiffTimestamp(locTimestamp) {
      return this.tempTimestamps.map((tempTimestamp) => {
        return Math.abs(new Date(locTimestamp) - new Date(tempTimestamp))
      })
    },

    getLocationTemp(diffTimestamps) {
      const minTimestamp = Math.min(...diffTimestamps)
      const indexMinTimestamp = diffTimestamps.indexOf(minTimestamp)
      return this.outsideTemps[indexMinTimestamp]
    }
  }
}
</script>

<style>
.map {
  height: 100vh;
  padding: 20px;
}
</style>
