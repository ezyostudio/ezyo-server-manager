<template>
    <div class="modal-container d-flex align-items-center justify-content-center p-0" :class="{active: this.show}" >
        <div class="backdrop" @click.prevent="closeModal"></div>
        <div class="modal w-50 row p-4" v-if="mutableProject">
            <div class="d-flex justify-content-end w-100 mb-1" >
                <button class="close" @click.prevent="closeModal">
                    <icon-x-circle width="30" height="30" />
                </button>
                
            </div>
            <h2 class="text-center">{{mutableProject.name}}</h2>
            <div class="mb-3">
                <h3 class="my-0">Project type:</h3>
                <select name="type" id="type" v-model="mutableProject.type">
                    <option value="unknown">Non défini</option>
                    <option value="static">Statique</option>
                    <option value="node">NodeJS</option>
                </select>
            </div>
            <div class="mb-3">
                <h3 class="mb-0">Repository URL:</h3>
                <input v-model="mutableProject.repository"/>
            </div>
            <div class="mb-4">
                <h3 class="mb-0">Created At</h3>
                <input readonly :value="$dayjs(mutableProject.createdAt).format('DD/MM/YYYY')">
            </div>

            <div class="row">
                <button class="col-auto btn-success py-2 px-3 m-auto" @click.prevent="sendUpdate">Sauvegarder</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    opacity: 0;
    backdrop-filter: blur(0px) opacity(0);
    pointer-events: none;
    transition: backdrop-filter .3s ease-in, opacity .3s ease-in;

    .backdrop {
        background: rgba($color: #000000, $alpha: 0.3);
        width: 100vw;
        height: 100vh;
    }

    .modal {
        transform: translateY(50px);
        transition: transform .3s ease-out;
        position: absolute;
        background: white;
        border-radius: 20px;

        .close {
            background: transparent;
            outline: none;
            border: 0;
            margin: 0;
            padding: 0;
        }

        input, select {
            padding: .5em .8em;
            background: #e9e7e7;
            border: none;
            border-radius: 10px;
            width: 100%;
            outline: none;
        }

    }
    
    &.active {
        backdrop-filter: blur(10px) opacity(1);
        opacity: 1;
        pointer-events: all;
        transform: translateY(0px);

        .modal {
            transform: translateY(0px);
            z-index: 1000;
        }
    }

}
</style>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        project: {
            type: Object
        }
    },
    data() {
        return {
            mutableProject: null,
        }
    },
    watch: {
        project() {
            if(typeof this.project !== 'object') return;
            this.mutableProject = {...this.project};
        }
    },
    methods: {
        closeModal() {
            console.log("closing")
            this.$emit('close');
        },
        sendUpdate() {
            this.$api.$put("/projects", {
              data: this.mutableProject
            })
        }
    }
}
</script>