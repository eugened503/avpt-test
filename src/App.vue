<template>
  <div style="height: 100vh">
    <yandex-map
      ref="map"
      style="width: 100%; height: 100%"
      :zoom="15"
      :coords="[59.132296, 37.84513]"
      :controls="[]"
    >
    </yandex-map>
  </div>
</template>

<script>
import { loadYmap } from 'vue-yandex-maps'
import location from '@/data/location.json'
import temperatures from '@/data/temperatures.json'
import locomotive from '@/assets/images/locomotive.svg'
import mapsmark from '@/assets/images/mapsmark.svg'

export default {
  name: 'App',
  data() {
    return {
      points: null,
      locoType: null,
      locoNumber: null
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

    this.points = latitudes.map((latitude, index) => ({
      coordinates: [latitude, longitudes[index]],
      locationTime: this.getLocationTime(
        this.getDiffTimestamp(locTimestamp[index], tempTimestamps),
        outsideTemps
      )
    }))
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
        content: `<div>тип: ${this.locoType} | номер: ${this.locoNumber}</div>`,
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
          hintContent: `температура: ${point.locationTime}℃`
        },
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: '',
          iconImageSize: [30, 42],
          iconImageOffset: [-5, -38]
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
    getDiffTimestamp(locTimestamp, tempTimestamps) {
      return tempTimestamps.map((tempTimestamp) => {
        return Math.abs(new Date(locTimestamp) - new Date(tempTimestamp))
      })
    },

    getLocationTime(diffTimestamps, outsideTemps) {
      const minTimestamp = Math.min(...diffTimestamps)
      const indexMinTimestamp = diffTimestamps.indexOf(minTimestamp)
      return outsideTemps[indexMinTimestamp]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
